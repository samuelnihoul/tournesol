"""
API endpoints to show public statistics
"""
from dataclasses import dataclass, field
from datetime import datetime, time, timezone
from typing import List

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from core.models import User
from core.utils.time import time_ago
from tournesol.models import Comparison, Entity, Poll
from tournesol.serializers.stats import StatisticsSerializer


@dataclass
class ActiveUsersStatistics:
    total: int
    joined_last_30_days: int
    # This field is only kept for backward compatibility. It can be safely removed as soon as the
    # frontend is not using it anymore. Renamed to `..._last_30_days`. See also the similar fields
    # in other dataclasses in this file.
    joined_last_month: int = field(init=False)

    def __post_init__(self):
        self.joined_last_month = self.joined_last_30_days


@dataclass
class ComparedEntitiesStatistics:
    total: int
    added_last_30_days: int
    # This field is only kept for backward compatibility. It can be safely removed as soon as the
    # frontend is not using it anymore. Renamed to `..._last_30_days`. See also the similar fields
    # in other dataclasses in this file.
    added_last_month: int = field(init=False)

    def __post_init__(self):
        self.added_last_month = self.added_last_30_days


@dataclass
class ComparisonsStatistics:
    total: int
    added_last_30_days: int
    added_current_week: int
    # This field is only kept for backward compatibility. It can be safely removed as soon as the
    # frontend is not using it anymore. Renamed to `..._last_30_days`. See also the similar fields
    # in other dataclasses in this file.
    added_last_month: int = field(init=False)

    def __post_init__(self):
        self.added_last_month = self.added_last_30_days


@dataclass
class PollStatistics:
    name: str
    compared_entities: ComparedEntitiesStatistics
    comparisons: ComparisonsStatistics


class Statistics:
    """
    Representation of the Tournesol's public statistics.
    """

    active_users: ActiveUsersStatistics
    polls: List[PollStatistics]

    def __init__(self):
        self.active_users = ActiveUsersStatistics(0, 0)
        self.polls = []

    def set_active_users(self, user_count, last_month_user_count):
        self.active_users = ActiveUsersStatistics(user_count, last_month_user_count)

    def append_poll(
        self,
        poll_name: str,
        compared_entities_statistics: ComparedEntitiesStatistics,
        comparisons_statistics: ComparisonsStatistics,
    ):
        self.polls.append(
            PollStatistics(
                poll_name,
                compared_entities_statistics,
                comparisons_statistics,
            )
        )


@extend_schema_view(
    get=extend_schema(description="Fetch all Tournesol's public statistics.")
)
class StatisticsView(generics.GenericAPIView):
    """Return popularity statistics about Tournesol"""
    permission_classes = [AllowAny]
    serializer_class = StatisticsSerializer

    _days_delta = 30

    def get(self, request):
        statistics = Statistics()

        active_users = User.objects.filter(is_active=True).count()
        last_month_active_users = User.objects.filter(
            is_active=True, date_joined__gte=time_ago(days=self._days_delta)
        ).count()
        statistics.set_active_users(active_users, last_month_active_users)

        for poll in Poll.objects.iterator():
            compared_entities_statistics = self._get_compared_entities_statistics(poll)
            comparisons_statistics = self._get_comparisons_statistics(poll)
            statistics.append_poll(
                poll.name,
                compared_entities_statistics,
                comparisons_statistics,
            )

        return Response(StatisticsSerializer(statistics).data)

    def _get_compared_entities_statistics(self, poll):
        entities = Entity.objects.filter(type=poll.entity_type)
        compared_entities = entities.filter(rating_n_ratings__gt=0)
        compared_entity_count = compared_entities.count()
        last_30_days_compared_entity_count = compared_entities.filter(
            add_time__gte=time_ago(days=self._days_delta),
        ).count()

        compared_entities_statistics = ComparedEntitiesStatistics(
            compared_entity_count,
            last_30_days_compared_entity_count,
        )
        return compared_entities_statistics

    def _get_comparisons_statistics(self, poll):
        last_monday = datetime.combine(
            time_ago(days=datetime.now().weekday()),
            time.min,
            tzinfo=timezone.utc,
        )
        comparisons = Comparison.objects.filter(poll=poll, user__is_active=True)
        comparison_count = comparisons.count()
        last_30_days_comparison_count = comparisons.filter(
            datetime_add__gte=time_ago(days=self._days_delta)
        ).count()
        current_week_comparison_count = comparisons.filter(
            datetime_add__gte=last_monday
        ).count()

        comparisons_statistics = ComparisonsStatistics(
            comparison_count,
            last_30_days_comparison_count,
            current_week_comparison_count,
        )
        return comparisons_statistics
