"""Collection Plans

Revision ID: d6f2c9afc6dd
Revises: a0a19e8df32a
Create Date: 2024-05-10 17:04:31.510985

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6f2c9afc6dd'
down_revision: Union[str, None] = 'a0a19e8df32a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('collection_plans',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('area_of_collection', sa.String(), nullable=False),
    sa.Column('start_time_hr', sa.Integer(), nullable=False),
    sa.Column('start_time_min', sa.Integer(), nullable=False),
    sa.Column('duration', sa.Integer(), nullable=False),
    sa.Column('no_of_labour', sa.Integer(), nullable=False),
    sa.Column('no_of_vehicle', sa.Integer(), nullable=False),
    sa.Column('daily_waste_ton', sa.Float(), nullable=False),
    sa.Column('contract_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['contract_id'], ['contracts.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_collection_plans_id'), 'collection_plans', ['id'], unique=False)


    meta = sa.MetaData()
    plan_tbl = sa.Table('collection_plans', meta, autoload_with=op.get_bind())
    op.bulk_insert(plan_tbl, [
        {"id": 1, "area_of_collection": "Farmgate", "start_time_hr": 8, "start_time_min": 0, "duration": 480, "no_of_labour": 10, "no_of_vehicle": 2, "daily_waste_ton": 100.0, "contract_id": 1}
    ])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_collection_plans_id'), table_name='collection_plans')
    op.drop_table('collection_plans')
    # ### end Alembic commands ###
