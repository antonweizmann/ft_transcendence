from django.db import models # type: ignore
from django.contrib.auth import get_user_model # type: ignore
from .match_base import STATUS_CHOICES

User = get_user_model()

class TournamentBaseModel(models.Model):
	class Meta:
		abstract = True

	name = models.CharField(max_length=100)
	lobby_id = models.CharField(max_length=100, default='missing')
	size = models.PositiveIntegerField(default = 3)
	description = models.TextField(blank=True)
	'''
	It is necessary to add a unique related_name in each concrete class, either
	by overriding the players field or by changing the related_name in the
	__init__ method of the concrete class.
	'''
	players = models.ManyToManyField(User, related_name='tournaments', blank=True)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES,
		default='waiting')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return (f"Tournament #{self.id} {self.name}\n\t- {self.get_status_display()}")