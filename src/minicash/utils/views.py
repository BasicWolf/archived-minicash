from rest_framework import views
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response



class MassDeleteView(views.APIView):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated, )
    model_class = None

    def post(self, request):
        return Response('OK')

    def get_queryset(self):
        model_class.objects.for_owner(self.request.user)
