# Generated migration for adding created_at field to Booking model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_booking_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
