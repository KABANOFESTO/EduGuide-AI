from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="email_notifications",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="in_app_notifications",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="auto_approve_high_confidence",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="two_factor_enabled",
            field=models.BooleanField(default=False),
        ),
    ]
