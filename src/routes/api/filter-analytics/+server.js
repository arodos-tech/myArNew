import { json } from '@sveltejs/kit';

export async function GET({ url, locals }) {
  const filterId = url.searchParams.get('filter');
  const period = url.searchParams.get('period') || 'daily';
  
  let groupBy;
  switch(period) {
    case 'weekly': 
      groupBy = 'YEARWEEK(timestamp)';
      break;
    case 'monthly': 
      groupBy = 'DATE_FORMAT(timestamp, "%Y-%m")';
      break;
    default: 
      groupBy = 'DATE(timestamp)';
  }

  const query = `
    SELECT 
      ${groupBy} as period,
      COUNT(*) as count
    FROM log_datas 
    WHERE filter = ? 
    GROUP BY period 
    ORDER BY period DESC 
    LIMIT 30
  `;

  const results = await locals.db.query(query, [filterId]);
  return json(results);
}