class ManagerBase:
	class Meta:
		abstract = True

	__instance = None
	__Managed_objects = {}

	def __new__(cls, *args, **kwargs):
		if not cls.__instance:
			cls.__instance = super(ManagerBase, cls).__new__(cls, *args, **kwargs)
		return cls.__instance

	def _get_object(self, object_handler, object_id: str):
		if object_id not in self.__Managed_objects:
			self.__Managed_objects[object_id] = object_handler(object_id)
		return self.__Managed_objects[object_id]

	def _remove_object(self, object_id: str):
		if object_id in self.__Managed_objects:
			del self.__Managed_objects[object_id]