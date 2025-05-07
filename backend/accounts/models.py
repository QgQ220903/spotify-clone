from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class CustomUser(AbstractUser):
    # User type choices
    USER_TYPE_CHOICES = (
        ('listener', _('Listener')),
        ('admin', _('Admin')),
    )
    
    user_type = models.CharField(
        max_length=10, 
        choices=USER_TYPE_CHOICES, 
        verbose_name=_('User Type')
    )
    bio = models.TextField(blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='followers')
    
    def __str__(self):
        return self.username
    
    @property
    def is_admin_user(self):
        return self.user_type == 'admin'
    
    @property
    def is_listener(self):
        return self.user_type == 'listener'