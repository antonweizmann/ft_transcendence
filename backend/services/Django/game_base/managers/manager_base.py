import gc

class ManagerBase:
	__instance = None

	class Meta:
		abstract = True

	def __new__(cls, *args, **kwargs):
		if not cls.__instance:
			cls.__instance = super(ManagerBase, cls).__new__(cls, *args, **kwargs)
		return cls.__instance

	def __init__(self):
		self.__managed_objects = {}

	def _get_object(self, object_handler, object_id: str):
		if object_id not in self.__managed_objects:
			self.__managed_objects[object_id] = object_handler(object_id)
		return self.__managed_objects[object_id]

	def _remove_object(self, object_id: str):
		if object_id in self.__managed_objects:
			del self.__managed_objects[object_id]
			gc.collect()