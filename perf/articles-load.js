// Run ONLY against a local backend: k6 run -e API_URL=http://localhost:3000 

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${__ENV.API_URL}/api/articles?limit=10`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}