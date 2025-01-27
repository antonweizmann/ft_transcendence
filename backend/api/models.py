from django.db import models
from django.contrib.auth.models import AbstractUser	

class PongPlayer(AbstractUser):
	last_connection = models.DateTimeField(auto_now=True)

	friends = models.ManyToManyField("self", symmetrical=True, blank=True)
	friend_requests_sent = models.ManyToManyField("self", symmetrical=False,
		related_name="friend_requests_received", blank=True)

	def __str__(self):
		return self.username + " (" + self.first_name + " " + self.last_name + ")"