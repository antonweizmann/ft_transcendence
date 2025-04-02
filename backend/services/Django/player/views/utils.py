from player.models import Player

def get_user_and_target(user_id, target_id):
	try:
		user_id = int(user_id)
		target_id = int(target_id)
	except (ValueError, TypeError):
		return None, None
	try:
		auth_user = Player.objects.get(pk=user_id)
		target_player = Player.objects.get(pk=target_id)
		return auth_user, target_player
	except Player.DoesNotExist:
		return None, None