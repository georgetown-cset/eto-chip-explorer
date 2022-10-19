select
  type as x,
  count(*) as y
from eto_chipexplorer.inputs
where type != 'ultimate_output'
group by x
order by x asc
