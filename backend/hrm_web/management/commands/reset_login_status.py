from django.core.management.base import BaseCommand
from hrm_web.models import EMSColleague


class Command(BaseCommand):
    help = "Reset EMS colleague login status to no"

    def handle(self, *args, **kwargs):
        updated_count = EMSColleague.objects.filter(
            clg_is_login__in=["yes", "break"]
        ).update(
            clg_is_login="no"
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully reset {updated_count} users to no."
            )
        )