# Generated migration for adding slots field to Booking model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_booking_id_alter_order_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='slots',
            field=models.IntegerField(default=1, help_text='Number of slots/guests/swimmers for this booking'),
        ),
    ]

