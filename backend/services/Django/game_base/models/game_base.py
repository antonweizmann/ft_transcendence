from django.db import models # type: ignore
from django.contrib.auth import get_user_model # type: ignore

import gc

User = get_user_model()

STATUS_CHOICES = [
	('waiting', 'Waiting to Start'),
	('in_progress', 'In Progress'),
	('finished', 'Finished')
]

class GameBaseModel(models.Model):
	class Meta:
		abstract = True

	game_type = models.CharField(max_length=20, default='Unknown')
	required_players = models.IntegerField(default=2)
	players = models.ManyToManyField(User, related_name='games', blank=True)
	scores = models.JSONField(null=True, blank=True)
	result = models.JSONField(null=True, blank=True) # Don't set this manually
	status = models.CharField(max_length=20, choices=STATUS_CHOICES,
		default='waiting')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	'''
	This field needs to be overridden in the concrete class with a concrete
	ForeignKey to the concrete Tournament model.
	'''
	tournament = models.ForeignKey('TournamentBase', related_name='matches',
		on_delete=models.CASCADE, null=True, blank=True)
	
	def __str__(self):
		return (f"Game of {self.game_type} #{self.id}\n\t- {self.get_status_display()}")

	def save(self, *args, **kwargs):
		if not self.pk:
			super(GameBaseModel, self).save(*args, **kwargs)
			return
		if self.players.count() == 0 and self.status != 'waiting':
			self.delete()
			gc.collect()
			return
		if self.status == 'finished' and self.result is None and self.scores:
			self.result = {
				'player_scores': {
					player.username: self.scores.get(str(player.username), 0)
					for player in self.players.all()
				}
			}
		super(GameBaseModel, self).save(*args, **kwargs)
