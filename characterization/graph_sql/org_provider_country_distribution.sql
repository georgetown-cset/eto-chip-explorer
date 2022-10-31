select
  country as x,
  count(*) as y
from eto_chipexplorer.providers
where provider_type = 'organization'
group by x
order by x asc
