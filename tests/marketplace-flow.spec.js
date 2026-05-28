const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.WORKINDEX_BASE_URL || 'http://127.0.0.1:5500/';

test.use({ channel: 'chrome' });

function createMockStore() {
  const request = {
    _id: 'req-smoke-1',
    service: 'gst',
    title: 'GST Services',
    description: 'Need monthly GST return filing and reconciliation for a small business.',
    budget: 2500,
    timeline: 'this_week',
    location: 'Bengaluru',
    status: 'active',
    currentApproaches: 0,
    approachCount: 0,
    createdAt: new Date().toISOString(),
    client: {
      _id: 'client-smoke-1',
      name: 'Client Smoke',
      email: 'client.smoke@example.com',
      phone: '9876543210'
    }
  };

  return {
    requests: [request],
    approaches: [],
    users: {
      client: {
        _id: 'client-smoke-1',
        name: 'Client Smoke',
        email: 'client.smoke@example.com',
        role: 'client',
        profile: {}
      },
      expert: {
        _id: 'expert-smoke-1',
        name: 'Ravi CA',
        email: 'expert.smoke@example.com',
        role: 'expert',
        credits: 50,
        rating: 4.8,
        reviewCount: 3,
        responseRate: 90,
        totalApproaches: 2,
        profilePhoto: 'yes',
        questionnaireCompleted: true,
        profile: {
          bio: 'Chartered accountant handling GST, ITR and accounting work for small businesses.',
          specialization: 'GST filing and reconciliation',
          city: 'Bengaluru',
          pincode: '560001',
          gstNumber: '29ABCDE1234F1Z5',
          licenseNumber: 'CA-123456',
          education: 'CA',
          portfolio: 'GST and accounting portfolio'
        }
      }
    }
  };
}

async function mockApi(page, store) {
  await page.route('https://workindex-production.up.railway.app/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api/, '');
    const method = req.method();

    const json = (body, status = 200) => route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body)
    });

    if (method === 'PUT' && path === '/users/profile') {
      return json({ success: true, user: store.users.client });
    }

    if (method === 'GET' && path === '/users/me') {
      return json({ success: true, user: store.users.expert });
    }

    if (method === 'POST' && path === '/requests') {
      const body = JSON.parse(req.postData() || '{}');
      const created = {
        ...body,
        _id: `req-smoke-${store.requests.length + 1}`,
        status: 'active',
        currentApproaches: 0,
        approachCount: 0,
        createdAt: new Date().toISOString(),
        client: store.users.client
      };
      store.requests.unshift(created);
      return json({ success: true, request: created });
    }

    if (method === 'GET' && path === '/requests') {
      return json({ success: true, requests: store.requests });
    }

    if (method === 'GET' && path === '/requests/available') {
      return json({ success: true, requests: store.requests.filter((item) => item.status === 'active') });
    }

    const completeMatch = path.match(/^\/requests\/([^/]+)\/complete$/);
    if (method === 'POST' && completeMatch) {
      const found = store.requests.find((item) => item._id === completeMatch[1]);
      if (found) found.status = 'completed';
      return json({ success: true, request: found });
    }

    const requestApproachesMatch = path.match(/^\/requests\/([^/]+)\/approaches$/);
    if (method === 'GET' && requestApproachesMatch) {
      return json({
        success: true,
        approaches: store.approaches.filter((item) => {
          const requestId = item.request?._id || item.request;
          return String(requestId) === String(requestApproachesMatch[1]);
        })
      });
    }

    if (method === 'POST' && path === '/approaches') {
      const body = JSON.parse(req.postData() || '{}');
      const requestItem = store.requests.find((item) => item._id === body.request) || store.requests[0];
      const approach = {
        _id: `app-smoke-${store.approaches.length + 1}`,
        request: requestItem,
        expert: store.users.expert,
        client: store.users.client,
        message: body.message,
        quote: body.quote,
        status: 'pending',
        creditsSpent: 15,
        createdAt: new Date().toISOString()
      };
      store.approaches.push(approach);
      if (requestItem) {
        requestItem.currentApproaches = (requestItem.currentApproaches || 0) + 1;
        requestItem.approachCount = requestItem.currentApproaches;
      }
      return json({ success: true, approach });
    }

    if (method === 'GET' && path === '/approaches') {
      return json({ success: true, approaches: store.approaches });
    }

    const approachMatch = path.match(/^\/approaches\/([^/]+)$/);
    if (method === 'GET' && approachMatch) {
      return json({ success: true, approach: store.approaches.find((item) => item._id === approachMatch[1]) });
    }

    if (path === '/notifications') {
      return json({ success: true, notifications: [] });
    }

    if (path.includes('/ratings') || path.includes('/documents') || path.includes('/chats') || path.includes('/tickets')) {
      return json({ success: true, ratings: [], documents: [], chats: [], tickets: [] });
    }

    return json({ success: true });
  });
}

async function openApp(page) {
  await page.goto(BASE_URL);
  await page.waitForFunction(() => typeof WI_SERVICES !== 'undefined' && typeof showPage === 'function' && typeof submitQuestionnaire === 'function');
}

test.describe('WorkIndex marketplace smoke flow', () => {
  test('client can post a request through the questionnaire submit path', async ({ page }) => {
    const store = createMockStore();
    await mockApi(page, store);
    await openApp(page);

    const result = await page.evaluate(async () => {
      state.token = 'client-token';
      state.user = { _id: 'client-smoke-1', name: 'Client Smoke', email: 'client.smoke@example.com', role: 'client', profile: {} };
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
      qState = {
        step: 0,
        sequence: [],
        role: 'client',
        answers: {
          service: 'gst',
          description: 'Need monthly GST return filing and reconciliation for a small business.',
          budget: 2500,
          urgency: 'this_week',
          service_location_type: 'online',
          client_location: 'Bengaluru'
        }
      };
      await submitQuestionnaire();
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        currentPage: state.currentPage,
        confirmationVisible: document.getElementById('requestConfirmation')?.classList.contains('active'),
        confirmationText: document.body.innerText
      };
    });

    expect(result.currentPage).toBe('requestConfirmation');
    expect(result.confirmationVisible).toBeTruthy();
    expect(result.confirmationText).toContain('Request Posted');
    expect(store.requests[0].title).toBe('GST Services');
  });

  test('expert can approach an available client request', async ({ page }) => {
    const store = createMockStore();
    await mockApi(page, store);
    await openApp(page);

    const result = await page.evaluate(async (expertUser) => {
      state.token = 'expert-token';
      state.user = expertUser;
      state.availableRequests = [{
        _id: 'req-smoke-1',
        service: 'gst',
        title: 'GST Services',
        description: 'Need monthly GST return filing and reconciliation for a small business.',
        budget: 2500,
        timeline: 'this_week',
        location: 'Bengaluru',
        status: 'active',
        createdAt: new Date().toISOString(),
        client: { _id: 'client-smoke-1', name: 'Client Smoke' }
      }];
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
      showPage('expertDash');
      approachClient('req-smoke-1');
      document.getElementById('approachQuote').value = '2200';
      document.getElementById('approachMessage').value = 'I can complete GST filing and reconciliation with a clear checklist and timely updates.';
      await submitApproach();
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        modalDisplay: document.getElementById('approachModal')?.style.display,
        pageText: document.body.innerText
      };
    }, store.users.expert);

    expect(store.approaches).toHaveLength(1);
    expect(store.approaches[0].quote).toBe(2200);
    expect(result.modalDisplay).toBe('none');
    expect(result.pageText).toContain('Approach sent successfully');
  });

  test('client can mark service completed and reaches rating prompt', async ({ page }) => {
    const store = createMockStore();
    store.approaches.push({
      _id: 'app-smoke-1',
      request: store.requests[0],
      expert: store.users.expert,
      client: store.users.client,
      message: 'I can help with this GST filing.',
      quote: 2200,
      status: 'accepted',
      creditsSpent: 15,
      createdAt: new Date().toISOString()
    });
    await mockApi(page, store);
    await openApp(page);

    const result = await page.evaluate(async (clientUser) => {
      state.token = 'client-token';
      state.user = clientUser;
      state.requests = [{
        _id: 'req-smoke-1',
        service: 'gst',
        title: 'GST Services',
        description: 'Need monthly GST return filing and reconciliation for a small business.',
        budget: 2500,
        status: 'active',
        currentApproaches: 1,
        approachCount: 1,
        createdAt: new Date().toISOString()
      }];
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
      confirmServiceReceived('req-smoke-1', 'expert-smoke-1', 'Ravi CA', 'app-smoke-1');
      await markServiceComplete('req-smoke-1', 'expert-smoke-1', 'Ravi CA', 'app-smoke-1');
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        bodyText: document.body.innerText,
        modalCount: document.querySelectorAll('[style*="position: fixed"]').length
      };
    }, store.users.client);

    expect(store.requests[0].status).toBe('completed');
    expect(result.bodyText).toContain('Rate Ravi CA');
    expect(result.modalCount).toBeGreaterThan(0);
  });
});
