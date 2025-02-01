import os
from django.db import models # type: ignore
from django.contrib.auth.models import AbstractUser # type: ignore
from django.utils.text import slugify # type: ignore

def get_profile_picture_upload_path(instance, filename):
	ext = filename.split('.')[-1]
	filename = '{}_{}.{}'.format(instance.id, slugify(instance.username), ext)
	return os.path.join('profile_pictures/', filename)

# Create your models here.
class Player(AbstractUser):
	friends = models.ManyToManyField('self', blank=True, symmetrical=True)
	friend_requests = models.ManyToManyField('self', blank=True,
		symmetrical=False, related_name='friend_request_received')
	profile_picture = models.ImageField(upload_to=get_profile_picture_upload_path,
		blank=True, null=True)

	class Meta:
		ordering = ['username']

	def __str__(self):
		return f"{self.id}_{self.username}"
