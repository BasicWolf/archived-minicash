from rest_framework import views

class MassDeleteView(views.APIView):
    model_class = None

    def post(self):
        pass

    def get_queryset(self):
        model_class.objects.for_owner(self.request.user)
