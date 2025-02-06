from django.db import models # type: ignore
from django.contrib.auth import get_user_model # type: ignore

User = get_user_model()

class GameMatchBase(models.Model):
	class Meta:
		abstract = True

	game_type = models.CharField(max_length=20, default='Unknown')
	required_players = models.IntegerField(default=2)
	players = models.ManyToManyField(User, related_name='games', blank=True)
	scores = models.JSONField(null=True, blank=True)
	result = models.JSONField(null=True, blank=True) # Don't set this manually
	status = models.CharField(max_length=20, choices=[
		('waiting', 'Waiting to Start Match'), ('in_progress', 'In Progress'),
		('finished', 'Finished')], default='waiting')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	
	def __str__(self):
		player_names = ', '.join(self.players.values_list('username', flat=True))
		missing_players = self.required_players - self.players.count()
		if missing_players > 0 and self.status == 'finished':
			player_names += ', ' + ', '.join(['Deleted User'] * missing_players)
		return (f"Game of {self.game_type} #{self.id} between {player_names}" + # type: ignore
				f"\n\t- {self.get_status_display()}")

	def save(self, *args, **kwargs):
		if not self.pk:
			super(GameMatchBase, self).save(*args, **kwargs)
			return
		if self.players.count() == 0 and self.status != 'waiting':
			self.delete()
			return
		if self.status == 'finished' and self.result is None and self.scores:
			self.result = {
				'player_scores': {
					player.username: self.scores.get(str(player.__str__()), 0)
					for player in self.players.all()
				}
			}
		super(GameMatchBase, self).save(*args, **kwargs)
