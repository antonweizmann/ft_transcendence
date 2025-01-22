from django.db import models

# Create your models here.
class User(models.Model):
	username = models.CharField(max_length=50)
	email = models.EmailField()
	password = models.CharField(max_length=50)
	date_of_birth = models.DateField()
	created_at = models.DateTimeField(auto_now_add=True)
	last_connection = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.username + " " + self.email