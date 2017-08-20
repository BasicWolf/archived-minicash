from typing import Optional

from django.db import models
from rest_framework import views
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class MassDeleteView(views.APIView):
    '''
    A bulk delete operation view.
    '''
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated, )
    model_class: Optional[models.Model] = None
    batch_delete = False

    def post(self, request):
        pks = request.data.get('pks', [])
        if pks == []:
            return Response({'pks': []}, content_type='application/json')

        pks = [int(pk) for pk in pks]
        q = self.get_queryset().filter(pk__in=pks)

        if self.batch_delete:
            q.delete()
        else:
            for obj in q:
                self.perform_destroy(obj)

        return Response({'pks': pks}, content_type='application/json')

    def perform_destroy(self, instance):
        self.get_queryset().get(pk=instance.pk).delete()

    def get_queryset(self):
        return self.model_class.objects.for_owner(self.request.user)
