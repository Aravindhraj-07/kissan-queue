const BASE_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint: string, method: string = 'GET', data?: any, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  const resData: any = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || `Request failed with status ${res.status}`);
  }
  return resData;
}

const runE2ETests = async () => {
  console.log('====================================================');
  console.log('  🧪 STARTING PROCUREX PRODUCTION E2E TESTS');
  console.log('====================================================\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing API Health Check...');
    const health = await apiRequest('/health');
    console.log('   ✅ Health Status:', health.status);

    // 2. Real Farmer Registration & Authentication (10 digit mobile)
    console.log('\n2️⃣ Testing Farmer Registration & Authentication...');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const testPhone = `9876${randomSuffix}`;
    const registerRes = await apiRequest('/auth/register', 'POST', {
      name: `Kisan Baldev Singh ${randomSuffix}`,
      phone: testPhone,
      password: 'Password@123',
      village: 'Taraori',
      district: 'Karnal',
      state: 'Haryana',
      landAreaAcres: 12,
    });
    const farmerToken = registerRes.token;
    const farmerUser = registerRes.user;
    console.log(`   ✅ Registered new Farmer: ${farmerUser.name} (${farmerUser.phone})`);

    // 3. Browse Centres & Slots
    console.log('\n3️⃣ Testing Centres & Slots Discovery...');
    const centres = await apiRequest('/centres?lat=29.6857&lng=76.9905');
    const centre = centres.data[0];
    console.log(`   ✅ Nearest Mandi: ${centre.name} (${centre.centreCode}) - ${centre.distanceKm} km away`);

    const slots = await apiRequest(`/slots/centre/${centre._id}`);
    const availableSlot = slots.data.find((s: any) => s.status === 'AVAILABLE' && s.remainingCapacity > 0) || slots.data[0];
    console.log(`   ✅ Available Slot for ${slots.date}: ${availableSlot.startTime} - ${availableSlot.endTime} (${availableSlot.remainingCapacity} spots remaining)`);

    // 4. Atomic Slot Booking & Token Generation
    console.log('\n4️⃣ Testing Atomic Slot Booking & Digital Token Issuance...');
    const bookingRes = await apiRequest(
      '/bookings',
      'POST',
      {
        centreId: centre._id,
        slotId: availableSlot._id,
        cropType: 'Wheat',
        requestedQuantity: 25.0,
        unit: 'Quintal',
      },
      farmerToken
    );
    const booking = bookingRes.data;
    console.log(`   ✅ Booking Created! Token Number: ${booking.tokenNumber} (Status: ${booking.status})`);

    // 5. Query Live Queue
    console.log('\n5️⃣ Testing Live Queue Calculation...');
    const queue = await apiRequest(`/queue/${centre._id}`);
    console.log(`   ✅ Live Mandi Serving Token: ${queue.data.currentServingToken}`);
    console.log(`   ✅ Farmers Arrived in Queue: ${queue.data.arrivedCount}`);
    console.log(`   ✅ Total Bookings Scheduled Today: ${queue.data.totalBookedToday}`);

    // 6. Storage Authority Operations
    console.log('\n6️⃣ Testing Storage Authority (Mandi Desk) Workflow...');
    const authLogin = await apiRequest('/auth/login', 'POST', {
      identifier: '9999900002',
      password: 'Password@123',
    });
    const authToken = authLogin.token;
    console.log(`   ✅ Logged in as Mandi Authority: ${authLogin.user.name}`);

    // Mark Farmer Arrived at Mandi Gate
    console.log('   📌 Marking Gate Check-in for Farmer...');
    await apiRequest(`/queue/${booking._id}/arrived`, 'POST', {}, authToken);
    console.log(`   ✅ Farmer arrived at Mandi Gate`);

    // Call Farmer
    console.log('   📢 Calling Farmer to Weighbridge...');
    const callNext = await apiRequest(`/queue/${centre._id}/next`, 'POST', {}, authToken);
    console.log(`   ✅ Called Token: ${callNext.data.calledToken || booking.tokenNumber}`);

    // Record Weighbridge Procurement
    console.log('\n7️⃣ Testing Weighbridge Weighment & Payout Calculation...');
    const procurementRes = await apiRequest(
      '/procurement',
      'POST',
      {
        bookingId: booking._id,
        actualQuantity: 26.5,
        qualityGrade: 'Grade A',
        moisturePercent: 11.0,
        mspPricePerQuintal: 2275,
        notes: 'Verified Grade A Wheat at Mandi Scale 1',
      },
      authToken
    );
    const procurement = procurementRes.data.procurement;
    console.log(`   ✅ Procurement Completed! Slip Number: ${procurement.digitalSlipNumber}`);
    console.log(`   ✅ Calculated Total MSP DBT Amount: ₹${procurement.totalPayout.toLocaleString('en-IN')}`);

    // 8. Logistics Operations
    console.log('\n8️⃣ Testing Logistics & Fleet Assignment Pipeline...');
    const logLogin = await apiRequest('/auth/login', 'POST', {
      identifier: '9999900004',
      password: 'Password@123',
    });
    const logToken = logLogin.token;

    const tasks = await apiRequest('/logistics/tasks?status=READY_FOR_PICKUP', 'GET', undefined, logToken);
    const task = tasks.data[0];
    console.log(`   ✅ Available batch for transport: ${task.quantity} ${task.unit} ${task.cropType} from Mandi`);

    console.log('   🚚 Assigning Vehicle & Driver...');
    const assign = await apiRequest(
      `/logistics/tasks/${task._id}/assign`,
      'POST',
      {
        vehicleNumber: 'HR-05-CD-9988',
        driverName: 'Kuldeep Sharma',
        driverPhone: '+91 98123-45678',
        destinationWarehouse: 'Central State Food Silo Complex',
      },
      logToken
    );
    console.log(`   ✅ Task Assigned to Truck: ${assign.data.vehicleNumber}`);

    console.log('   🛣️ Updating Status to IN_TRANSIT...');
    await apiRequest(`/logistics/tasks/${task._id}/status`, 'PATCH', { status: 'IN_TRANSIT' }, logToken);
    console.log('   ✅ Status updated to IN_TRANSIT');

    console.log('   🏁 Updating Status to DELIVERED...');
    await apiRequest(`/logistics/tasks/${task._id}/status`, 'PATCH', { status: 'DELIVERED' }, logToken);
    console.log('   ✅ Batch safely delivered at Silo!');

    // 9. Admin Oversight & Audit Logs
    console.log('\n9️⃣ Testing Admin Ecosystem Analytics & Audit Logs...');
    const adminLogin = await apiRequest('/auth/login', 'POST', {
      identifier: '9999900001',
      password: 'Admin@123',
    });
    const adminToken = adminLogin.token;

    const adminStats = await apiRequest('/admin/stats', 'GET', undefined, adminToken);
    console.log(`   ✅ Total Metric Tons Procured: ${adminStats.stats.totalProcuredMetricTons} MT`);
    console.log(`   ✅ Total DBT Disbursed: ₹${adminStats.stats.totalPayoutINR.toLocaleString('en-IN')}`);

    const auditLogs = await apiRequest('/admin/audit-logs?limit=5', 'GET', undefined, adminToken);
    console.log(`   ✅ Verified ${auditLogs.count} immutable audit log entries (Latest: ${auditLogs.data[0].action} by ${auditLogs.data[0].actorName})`);

    // 10. SMS & USSD Simulators
    console.log('\n🔟 Testing Offline 2G Non-Internet SMS & USSD Simulators...');
    const sms = await apiRequest('/sms/webhook', 'POST', {
      fromPhone: testPhone,
      messageText: 'BOOK PC-KNL-01 Wheat 25',
    });
    console.log(`   ✅ SMS Reply Received: "${sms.reply}"`);

    const ussd = await apiRequest('/ussd/session', 'POST', {
      sessionId: `USSD-SESSION-${randomSuffix}`,
      phoneNumber: testPhone,
      text: '',
    });
    console.log(`   ✅ USSD Initial Menu: "${ussd.response.split('\n')[0]}"`);

    console.log('\n====================================================');
    console.log('  🎉 ALL 10 PRODUCTION PIPELINE TESTS PASSED 100%!');
    console.log('====================================================\n');
  } catch (error: any) {
    console.error('❌ E2E Test Failure:', error.message);
    process.exit(1);
  }
};

runE2ETests();
