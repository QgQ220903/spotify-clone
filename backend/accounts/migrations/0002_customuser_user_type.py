# Generated by Django 5.1.7 on 2025-05-02 16:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='user_type',
            field=models.CharField(choices=[('listener', 'Listener'), ('admin', 'Admin')], default='listener', max_length=10, verbose_name='User Type'),
        ),
    ]
