# Generated migration for adding price field to Booking model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_booking_due_date_booking_start_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Total price for this booking', max_digits=10),
        ),
    ]
