const SHEET_ENDPOINT =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTn4i2Pcg5uXo8h5h7jN7mY8a7WmVv5qSKiQ9E2N2VnQ9oC8xY9mQ4YzKQ4Tx/pub?output=csv';

const fallbackData = {
  'bond-services': {
    title: 'Bond Services',
    description: 'Federal, state, and specialty bond options are available 24/7.',
    points: ['Fast approval', 'Flexible collateral options', 'Licensed local support']
  },
  'gps-monitoring': {
    title: 'GPS Monitoring',
    description: 'Court-compliant monitoring with real-time status updates.',
    points: ['Setup guidance', 'Reporting assistance', 'Live support line']
  },
  'inmate-locator': {
    title: 'Inmate Locator',
    description: 'Search nearby county detention records and next-step guidance.',
    points: ['County lookup', 'Bond estimate help', 'Pickup coordination']
  },
  'payments-financing': {
    title: 'Payments & Financing',
    description: 'Simple payment plans with clear terms.',
    points: ['Low down payment options', 'Card and cash support', 'Auto-pay reminders']
  },
  'agent-nearby': {
    title: 'Find an Agent Near You',
    description: 'Connect with a local U.S. Bonding specialist now.',
    points: ['Immediate callback', 'Nearest office routing', '24/7 availability']
  }
};

let prefetchedData = { ...fallbackData };

async function prefetchSheetData() {
  try {
    const response = await fetch(SHEET_ENDPOINT, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Sheet request failed');

    const csv = await response.text();
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) return;

    const parsed = {};
    for (let i = 1; i < lines.length; i += 1) {
      const [key, title, description, point1, point2, point3] = lines[i]
        .split(',')
        .map((value) => value.replace(/^"|"$/g, '').trim());

      if (!key) continue;
      parsed[key] = {
        title: title || fallbackData[key]?.title || key,
        description: description || fallbackData[key]?.description || '',
        points: [point1, point2, point3].filter(Boolean)
      };
    }

    if (Object.keys(parsed).length > 0) {
      prefetchedData = { ...prefetchedData, ...parsed };
    }
  } catch {
    prefetchedData = { ...fallbackData };
  }
}

function renderServiceDetails(serviceKey) {
  const record = prefetchedData[serviceKey] || fallbackData[serviceKey];
  if (!record) return;

  document.getElementById('detail-title').textContent = record.title;
  document.getElementById('detail-description').textContent = record.description;

  const list = document.getElementById('detail-points');
  list.innerHTML = '';
  for (const point of record.points || []) {
    const item = document.createElement('li');
    item.textContent = point;
    list.appendChild(item);
  }
}

function bindButtons() {
  const buttons = document.querySelectorAll('[data-service]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((candidate) => candidate.classList.remove('active'));
      button.classList.add('active');
      renderServiceDetails(button.dataset.service);
    });
  });
}

prefetchSheetData().finally(bindButtons);
