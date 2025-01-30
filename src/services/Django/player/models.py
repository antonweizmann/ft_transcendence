from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Player(AbstractUser):
	friends = models.ManyToManyField('self', blank=True, symmetrical=True)
	friend_requests = models.ManyToManyField('self', blank=True,
		symmetrical=False, related_name='friend_request_received')

	class Meta:
		ordering = ['username']

	def __str__(self):
		return f"{self.id}_{self.username}"
