from django.shortcuts import render

# Create your views here.
def pong_game(request):
	return render(request, 'index.html')