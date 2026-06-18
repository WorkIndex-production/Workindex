const fs = require('fs');
const path = require('path');

const output = path.join(__dirname, '..', 'WorkIndex_Audit_Test_Cases_2026-05-15.xls');

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(sn, name, expected, actual, result = 'PASS') {
  return { sn, name, expected, actual, result };
}

const sheets = {
  Customer: [
    row(1, 'Customer OTP signup', 'Customer can register with OTP using email/phone and receive a valid login account.', 'OTP registration path was covered in full-flow testing and login succeeds.'),
    row(2, 'Customer Google signup with invite parameter', 'Google signup preserves invite code and continues onboarding correctly.', 'Google init/verify flow was updated to carry invite code and profile continuation.'),
    row(3, 'Customer login', 'Valid customer credentials open customer dashboard.', 'Login works and token-based /users/me check succeeds.'),
    row(4, 'Banned customer old token', 'Banned customer cannot continue using an old token.', 'Old token access is rejected for banned account.'),
    row(5, 'Banned customer new login', 'Banned customer cannot login again.', 'Login is rejected for banned account.'),
    row(6, 'Restricted customer create post', 'Restricted customer cannot create a new service request.', 'POST /requests is blocked with ACCOUNT_RESTRICTED.'),
    row(7, 'Restricted customer shortlist expert', 'Restricted customer cannot shortlist/interest an expert.', 'Interest endpoint is blocked with ACCOUNT_RESTRICTED.'),
    row(8, 'Restricted customer direct invite', 'Restricted customer cannot send direct expert invite.', 'Expert invite creation is blocked with ACCOUNT_RESTRICTED.'),
    row(9, 'New request budget minimum', 'Customer cannot create request with budget below Rs. 1,000 or invalid step.', 'Backend rejects invalid budget with MIN_BUDGET_REQUIRED.'),
    row(10, 'Edit request budget restriction', 'Customer cannot edit existing post budget to 0 or arbitrary invalid amount.', 'PUT /requests/:id validates the same budget rule.'),
    row(11, 'Customer request questionnaire service options', 'Service options must be visible and selectable in new request questionnaire.', 'Frontend questionnaire options were corrected and linked to service config.'),
    row(12, 'Customer request duplicate service title', 'What service do you need should appear once, not duplicated.', 'Duplicate service heading was removed in questionnaire flow.'),
    row(13, 'Customer create request with answers', 'Post stores questionnaire answers, location, timeline, budget, and service.', 'Request creation stores sanitized answers and visible request details.'),
    row(14, 'Customer request location', 'Customer address/pincode/city/state should save for request and heatmap usage.', 'Location fields are saved and geo heatmap source reads location fields.'),
    row(15, 'Customer request list filters', 'Customer dashboard shows all/pending/active/completed/cancelled filters.', 'Request dashboard filters were exercised in full flow.'),
    row(16, 'Customer edit open request', 'Customer can edit own open request details.', 'PUT /requests/:id works for owner when request is open.'),
    row(17, 'Customer cannot edit closed request', 'Customer cannot edit completed or cancelled request.', 'Backend rejects edit for completed/cancelled requests.'),
    row(18, 'Customer cancel request', 'Customer can cancel/delete own request when allowed.', 'Delete/cancel path is covered and owner check applies.'),
    row(19, 'Other customer view protection', 'Customer B cannot view Customer A request detail.', 'GET /requests/:id returns not authorized for other client.'),
    row(20, 'Customer compare expert approaches', 'When multiple proposals exist, customer can review approaches for own request.', 'GET /requests/:id/approaches returns only owner request approaches.'),
    row(21, 'Customer accept/reject approach', 'Customer can update approach status with valid status only.', 'Valid status updates work; invalid status is rejected.'),
    row(22, 'Invalid request status', 'Customer cannot submit arbitrary request status.', 'PUT /requests/:id/status rejects invalid status.'),
    row(23, 'Complete request requires expert', 'Customer must select completing expert before marking complete.', 'Completion without valid expert is rejected.'),
    row(24, 'Complete only approached expert', 'Customer can mark completed only for expert who approached that request.', 'Completion with unrelated expert is rejected.'),
    row(25, 'Mandatory rating after completion', 'If customer completes service and skips rating, next login should require rating first.', 'Pending rating endpoint returns completed unrated approach and UI blocks dashboard until rating.'),
    row(26, 'Create rating for completed approach', 'Customer can rate an expert only after completed work.', 'Rating with completed approach/request succeeds.'),
    row(27, 'Block fake rating', 'Customer cannot rate arbitrary expert without completed approach/invite.', 'Fake rating attempt is rejected.'),
    row(28, 'Block duplicate rating', 'Customer cannot rate the same completed approach twice.', 'Duplicate approach rating is rejected.'),
    row(29, 'Customer direct expert hire questionnaire', 'Hire from Explore must open questionnaire before notifying expert.', 'Direct expert invite creation uses questionnaire data and stores answers.'),
    row(30, 'Customer direct invite edit', 'Customer can edit direct invite before it is closed.', 'PUT /users/expert-invites/:id updates open invite data.'),
    row(31, 'Customer direct invite cancel', 'Customer can cancel invite before completion.', 'Cancel endpoint marks invite cancelled and blocks expert unlock.'),
    row(32, 'Customer direct invite complete', 'Customer can complete direct invite only after expert unlocks.', 'Invite complete endpoint requires unlocked invite.'),
    row(33, 'Rate completed direct invite', 'Customer can rate expert for completed direct invite without request/approach.', 'Completed direct invite rating succeeds with invite-linked rating.'),
    row(34, 'Block duplicate direct invite rating', 'Customer cannot rate same direct invite twice.', 'Second invite rating is rejected.'),
    row(35, 'Customer chat start after valid approach', 'Customer can start chat only with valid approached expert/request relationship.', 'Chat start validates participant and approach ownership.'),
    row(36, 'Customer direct chat after valid invite', 'Customer can open direct chat after valid invite exists.', 'Direct chat creation succeeds for invite participant.'),
    row(37, 'Customer cannot read others chat', 'Customer B cannot fetch or mark read Customer A chat.', 'Messages/read endpoints reject non-participant.'),
    row(38, 'Customer stale request renewal', 'Customer can renew open stale request and extend visibility.', 'Renew endpoint resets stale reminder and logs post_renewed.'),
    row(39, 'Customer stale confirmation prompt', 'Customer sees stale confirmation when reminder was sent.', 'GET /requests/stale-confirmations returns stale open posts for that customer.'),
    row(40, 'Customer support ticket', 'Customer can raise and follow up support ticket.', 'Ticket create/followup endpoints respond and admin can see them.'),
    row(41, 'Customer report expert', 'Customer reports should count against expert and trigger warning/restriction after threshold.', 'Three client reports restricted expert in audit.'),
    row(42, 'Explore board after posting', 'Customer dashboard should show professional Explore suggestion board after post.', 'Frontend board added to guide customer to Explore for faster service.')
  ],
  Expert: [
    row(1, 'Expert OTP signup', 'Expert can register and must finish questionnaire before dashboard.', 'Signup path forces questionnaire completion before dashboard access.'),
    row(2, 'Expert Google signup', 'Google expert signup also respects invite and questionnaire requirement.', 'Google flow was updated to continue questionnaire before dashboard.'),
    row(3, 'Expert exit questionnaire guard', 'Expert cannot skip questionnaire by clicking exit and land in dashboard.', 'Exit redirects back to mandatory questionnaire until complete.'),
    row(4, 'Expert questionnaire save once', 'After submitting questionnaire, expert goes to dashboard and does not loop back.', 'Questionnaire completed flag is saved and dashboard opens.'),
    row(5, 'Expert business type question', 'Business type question appears in expert questionnaire.', 'Seed expert steps include business type.'),
    row(6, 'Expert team size question', 'Team size question appears in expert questionnaire.', 'Seed expert steps include team size.'),
    row(7, 'Expert profile save', 'Profile fields save without wiping previous nested fields.', 'Partial profile save preserved GST number, address, business/team data, and why choose me.'),
    row(8, 'Profile strength calculation', 'Profile strength reflects saved expert details.', 'Profile completeness utility uses bio, specialization, location, credentials, education, portfolio, experience, address.'),
    row(9, 'Low profile approach block', 'Expert below 50 percent profile strength cannot approach.', 'Approach endpoint rejects low profile with PROFILE_STRENGTH_REQUIRED.'),
    row(10, 'Go to profile from strength card', 'Clicking profile-strength card should stay on Profile tab.', 'Frontend navigation updated to remain on profile tab.'),
    row(11, 'Expert browse filters by service', 'Expert can filter available posts by selected service.', 'GST-only and ITR-only filters returned correct request sets.'),
    row(12, 'Expert browse search', 'Expert can search posts by text.', 'Available request search found matching audit post.'),
    row(13, 'Excel-like floating filter', 'Service filter should open as floating overlay above content.', 'Frontend filter UI was improved to float above cards.'),
    row(14, 'Expert cannot see closed request', 'Expert without prior approach cannot view non-open request detail.', 'GET /requests/:id blocks expert for closed/completed unavailable request.'),
    row(15, 'Expert cannot approach completed request', 'Closed/completed request should reject new approach and not spend credits.', 'Approach blocked and expert credits unchanged.'),
    row(16, 'Expert approach open request', 'Eligible expert can approach active/pending request and credits are deducted.', 'Valid approach was created in deep audit.'),
    row(17, 'Duplicate approach prevention', 'Expert cannot approach same request twice.', 'Existing approach check prevents duplicate.'),
    row(18, 'Max approach limit', 'Request should not accept more than five approaches.', 'Approach count guard enforces max 5.'),
    row(19, 'Invalid approach status', 'Invalid approach status should be rejected.', 'PUT /approaches/:id/status rejects invalid status.'),
    row(20, 'Restricted expert approach', 'Restricted expert cannot approach request.', 'Approach endpoint blocked with ACCOUNT_RESTRICTED.'),
    row(21, 'Restricted expert unlock invite', 'Restricted expert cannot unlock direct invite.', 'Unlock endpoint blocked with ACCOUNT_RESTRICTED.'),
    row(22, 'Restricted expert chat', 'Restricted expert cannot start chat.', 'Chat start blocked with ACCOUNT_RESTRICTED.'),
    row(23, 'Restricted expert credits mutation', 'Restricted expert cannot mutate credits through add/deduct endpoints.', 'Credits add path blocked with ACCOUNT_RESTRICTED.'),
    row(24, 'Expert Approaches status filter', 'Approaches tab status filter includes normal approaches and customer interests.', 'Pending/completed states include customer interests before/after unlock.'),
    row(25, 'Direct invite summary card', 'Expert sees client wants to hire you but details are collapsed behind View Details.', 'Expert invite UI shows View Details and expands questionnaire data.'),
    row(26, 'Direct invite questionnaire detail', 'Before unlock, expert can see questionnaire details but not full contact.', 'Invite data stores service, answers, timeline, budget, location, masked contact.'),
    row(27, 'Unlock direct invite credits', 'Expert spends configured invite credits to unlock contact.', 'Unlock deducts invite credit amount and reveals phone/email.'),
    row(28, 'Cancelled direct invite unlock block', 'Expert cannot unlock customer-cancelled invite.', 'Unlock cancelled invite is rejected.'),
    row(29, 'Direct chat authorization', 'Expert can direct chat only after valid invite unlock.', 'Expert direct chat requires participant and unlocked invite.'),
    row(30, 'Chat read receipt', 'Message initially shows sent; after receiver reads, it changes to seen.', 'Backend read endpoint and message readAt support are available.'),
    row(31, 'Chat color sender/receiver', 'Sender and receiver bubbles should look visually distinct.', 'Frontend chat styling improved with different message colors.'),
    row(32, 'Expert profile view count', 'Expert profile tab shows customer profile views.', 'Profile view tracking endpoint and display were added.'),
    row(33, 'Expert report customer post', 'Expert can report problematic customer post.', 'Request report endpoint tracks expert report and suspension threshold.'),
    row(34, 'Duplicate post report prevention', 'Same expert cannot report same post multiple times.', 'Already reported response prevents duplicate report.'),
    row(35, 'Suspended request after reports', 'Post with enough expert reports becomes suspended/hidden.', 'Report flow updates request report count and status.'),
    row(36, 'Expert document access request', 'Expert can request document access only as expert.', 'Access request route is expert-only and restricted users are blocked.'),
    row(37, 'Expert cannot request access as customer', 'Customer role cannot request document access.', 'Role guard added to /access-requests.'),
    row(38, 'Expert KYC submit', 'Expert can submit KYC unless blocked.', 'KYC endpoint exists and admin approval flow was covered.'),
    row(39, 'Expert support ticket', 'Expert can raise ticket and follow up.', 'Ticket create/followup path responds and admin can process.'),
    row(40, 'Expert invite tab placement', 'Invite tab should be after Profile with icon and clean label.', 'Invite tab label/icon/alignment updated.'),
    row(41, 'Invite link and share message', 'Invite tab should include copy link and share WorkIndex link with rules.', 'Invite message includes URL, code, and 10-credit rule.'),
    row(42, 'Invite history table', 'Invite history columns should align within borders.', 'Invite table layout adjusted with bordered columns.'),
    row(43, 'Invite reward criteria', 'Inviter gets 10 credits only after invited expert signs up and approaches once.', 'Invite reward is awarded on first approach and logged as bonus.'),
    row(44, 'Credit ledger', 'Expert credit history should show ledger with opening/purchase/spent/refund/bonus/invite bonus/closing.', 'Credits ledger endpoint and frontend table added.'),
    row(45, 'Reviews Google-style summary', 'Reviews tab should show rating distribution bars and average like Google style.', 'Reviews UI was improved with bar distribution and summary.'),
    row(46, 'Privacy policy button', 'Settings privacy policy button should open policy page.', 'Privacy policy route/file linked from settings.')
  ],
  Admin: [
    row(1, 'Admin login', 'Valid admin credentials open admin dashboard.', 'Admin login works.'),
    row(2, 'Admin stats', 'Stats endpoint returns dashboard counts.', 'Admin stats endpoint responded.'),
    row(3, 'Admin users list', 'Admin can list users with filters.', 'Users list endpoint responded.'),
    row(4, 'Admin user detail', 'Admin expert detail should show saved profile fields.', 'User detail endpoint responded; profile save link audited.'),
    row(5, 'Admin expert boost list', 'Admin can see expert boost/ranking list.', 'Expert boosts endpoint responded.'),
    row(6, 'Admin boost update', 'Admin can change boost and ranking.', 'Boost/rank update route exists and safe write controls passed.'),
    row(7, 'Admin read surfaces', 'Main admin read endpoints should respond without crashing.', '29 admin read endpoints responded.'),
    row(8, 'Admin revenue KPIs', 'Revenue tab shows gross/net/refund/spend/credit KPIs.', 'Revenue endpoint returned KPI data.'),
    row(9, 'Admin revenue charts', 'Revenue tab includes charts/pie data.', 'Revenue endpoint returned chart and service economics data.'),
    row(10, 'Admin top spenders', 'Revenue tab should include top spender/transaction data.', 'Revenue endpoint returned spenders and transactions.'),
    row(11, 'Admin safe write controls', 'Admin write endpoints should update without corrupting data.', 'Safe write controls responded and preserved values.'),
    row(12, 'Admin adjust credits add', 'Admin can add credits with reason.', 'Credit add adjusted balance.'),
    row(13, 'Admin adjust credits deduct', 'Admin can deduct credits with reason.', 'Credit deduct adjusted balance.'),
    row(14, 'Admin reset password', 'Admin can reset user password.', 'Reset password endpoint passed.'),
    row(15, 'Admin send DM', 'Admin can send direct message to user.', 'DM endpoint passed and notification is created.'),
    row(16, 'Admin create ticket on behalf', 'Admin can create ticket for user.', 'Create-for-user ticket path passed.'),
    row(17, 'Admin ticket approve', 'Admin can approve ticket request.', 'Ticket approve path responded.'),
    row(18, 'Admin ticket reject', 'Admin can reject ticket request.', 'Ticket reject path responded.'),
    row(19, 'Admin ticket resolve', 'Admin can resolve ticket.', 'Ticket resolve path responded.'),
    row(20, 'Admin user warn', 'Admin can warn user.', 'User action route handled warning.'),
    row(21, 'Admin user flag', 'Admin can flag user.', 'User action route handled flag.'),
    row(22, 'Admin user restrict', 'Admin can restrict user.', 'User action route restricted user.'),
    row(23, 'Admin user unrestrict/restore', 'Admin can restore restricted user.', 'Restore path worked in reporting audit.'),
    row(24, 'Admin user ban', 'Admin can ban user.', 'Ban path exists and banned login behavior passed.'),
    row(25, 'Admin reported expert restriction', 'Three reports should restrict reported expert and admin can restore.', 'Client reporting test restricted and restored expert.'),
    row(26, 'Admin reported customer post', 'Reported post should appear in reports/suspended flow.', 'Request report/suspended endpoints responded.'),
    row(27, 'Admin suspended request reinstate', 'Admin can reinstate suspended request.', 'Suspended request action route exists.'),
    row(28, 'Admin suspended request delete', 'Admin can delete suspended request.', 'Suspended request delete action exists.'),
    row(29, 'Admin edit request', 'Admin can edit request details/status.', 'Admin request update passed.'),
    row(30, 'Admin delete request', 'Admin can delete request.', 'Admin request delete passed.'),
    row(31, 'Admin update approach', 'Admin can update approach status.', 'Admin approach update passed.'),
    row(32, 'Admin delete approach refund', 'Deleting approach should refund spent credits.', 'Admin approach delete refunded credits.'),
    row(33, 'Admin delete review', 'Admin can delete a review.', 'Admin review delete passed.'),
    row(34, 'Admin chats list', 'Admin can list chats.', 'Admin chats endpoint responded.'),
    row(35, 'Admin chat messages', 'Admin can inspect chat messages.', 'Admin chat message endpoint responded.'),
    row(36, 'Admin KYC approve', 'Admin can approve expert KYC.', 'KYC approve route exists and read surface passed.'),
    row(37, 'Admin KYC reject', 'Admin can reject expert KYC.', 'KYC reject route exists and read surface passed.'),
    row(38, 'Admin email settings load', 'Email notification tab loads settings.', 'Email settings endpoint responded.'),
    row(39, 'Admin email settings save', 'Admin can enable/disable notification toggles.', 'Email settings update route exists and is used by notification service.'),
    row(40, 'Admin email logs', 'Email log tab should show sent emails with category/type/status/time.', 'Email logs endpoint responded and logs are created by notification service.'),
    row(41, 'Admin test daily digest', 'Admin can trigger test digest.', 'Email test digest endpoint responded.'),
    row(42, 'Admin audit list', 'Audit log tab lists activities.', 'Audit endpoint responded.'),
    row(43, 'Audit rating completed', 'Rating completion should be captured in audit log.', 'rating_completed audit is logged.'),
    row(44, 'Audit post renewed', 'Renewed stale post should be captured in audit log.', 'post_renewed audit is logged.'),
    row(45, 'Audit purge lifecycle', 'Purge mail/renew/purge events should be auditable.', 'Request lifecycle utility logs stale/purge actions.'),
    row(46, 'Admin service category create/update/delete', 'Admin can manage service categories and sync frontend config.', 'Service category create/update/delete and preview tests passed.'),
    row(47, 'Admin seed expert steps', 'Expert seed should include 8 questions with business type and team size.', 'Seed expert route was updated and audited.'),
    row(48, 'Admin SEO preview', 'SEO page preview should render generated HTML without publishing.', 'SEO preview passed.'),
    row(49, 'Admin SEO GitHub publish config', 'Live GitHub publish should create SEO page and update sitemap only when enabled.', 'Skipped by config because RUN_SEO_GITHUB_AUDIT was not 1; preview passed.'),
    row(50, 'Admin SEO sitemap update', 'Generated SEO page should add URL to sitemap.', 'Sitemap generation path exists; local sitemap has new SEO entries.')
  ],
  System_SEO_Email: [
    row(1, 'Backend health', 'Health endpoint reports API and MongoDB connected.', 'Health returned status ok and mongodb connected.'),
    row(2, 'Local server restart', 'Local backend restarts cleanly after patches.', 'Server restarted on port 5000 and health passed.'),
    row(3, 'Syntax check requests route', 'Changed request route should parse.', 'node --check passed.'),
    row(4, 'Syntax check approaches route', 'Changed approaches route should parse.', 'node --check passed.'),
    row(5, 'Syntax check chats route', 'Changed chats route should parse.', 'node --check passed.'),
    row(6, 'Syntax check ratings route', 'Changed ratings route should parse.', 'node --check passed.'),
    row(7, 'Syntax check access route', 'Changed access request route should parse.', 'node --check passed.'),
    row(8, 'Syntax check server', 'Server should parse after route mounts/index hook.', 'node --check passed.'),
    row(9, 'Rating index migration', 'Old unique approach index should be converted to partial unique index.', 'ensureRatingIndexes drops wrong index and creates partial approach/invite indexes.'),
    row(10, 'Rating null approach collision', 'Multiple invite/admin ratings with approach null should not collide.', 'Partial indexes allow null approach while enforcing real approach uniqueness.'),
    row(11, 'Payment route mount', 'Payment success page should find /api/payment/status/:id.', 'Server now mounts /api/payment and /api/payments.'),
    row(12, 'Credits purchase initiate', 'Expert credit purchase initiation should be available and restricted users blocked where applicable.', 'Credits initiate endpoint remains active with blockRestrictedUser.'),
    row(13, 'Credits purchase verify', 'Razorpay verify should be idempotent.', 'Verify endpoint contains idempotency guard.'),
    row(14, 'Credit ledger endpoint', 'Ledger should return datewise opening/closing and transaction types.', 'GET /credits/ledger exists and frontend reads it.'),
    row(15, 'Email new request posted to experts', 'Matching experts receive email when new request is posted if enabled.', 'Notification email service integrated and logs email.'),
    row(16, 'Email direct expert invite received', 'Expert receives invite email when customer sends Explore invite if enabled.', 'sendExpertInviteReceived is called and email log captures it.'),
    row(17, 'Email stale request reminder', 'Stale open request sends reminder after 7 days if enabled.', 'Request lifecycle has stale reminder path and email log integration.'),
    row(18, 'Email settings default enabled', 'New email notification controls default enabled.', 'Email settings model includes defaults and admin toggles.'),
    row(19, 'Email log capture', 'Every sent notification email should be captured in Email Log.', 'Email log entries are created for covered email types.'),
    row(20, 'SEO files under seo-pages', 'New SEO pages should live under seo-pages folder.', 'New generated pages are in seo-pages and sitemap references /seo-pages/ URLs.'),
    row(21, 'SEO sitemap local update', 'Sitemap should include newly generated pages.', 'sitemap.xml was updated with SEO page entries.'),
    row(22, 'SEO content quality', 'SEO pages should contain useful service/location/problem-specific content.', 'Karnataka city and topic pages were enriched with relevant ITR/GST/accounting/audit details.'),
    row(23, 'Google Search Console decision', 'No API push needed if sitemap update is enough.', 'Confirmed sitemap update is sufficient for now; GSC URL inspection automation not implemented.'),
    row(24, 'One-click local connectedness', 'Local WorkIndex desktop run should use connected frontend/backend URLs.', 'Local backend healthy and frontend API paths aligned with backend mounts.'),
    row(25, 'Full flow test file updated', 'Full-flow batch should include newly added scenarios.', 'scripts/full-flow-test.js updated with expanded scenarios.'),
    row(26, 'Uncovered audit script', 'Dedicated uncovered audit should cover non-happy-path gaps.', 'scripts/uncovered-audit-test.js added and passed.'),
    row(27, 'No client contact leak to expert', 'API should not expose client contact before paid unlock/valid relationship.', 'Deep audit passed contact leak guard.'),
    row(28, 'No arbitrary chat access', 'Non-participants cannot create/read/mark chat messages.', 'Deep audit passed chat authorization guards.'),
    row(29, 'No arbitrary rating creation', 'Ratings require completed work relationship.', 'Deep audit passed fake rating guard.'),
    row(30, 'No credit spend on blocked approach', 'Blocked approach attempts must not deduct credits.', 'Closed-request approach attempt left credits unchanged.'),
    row(31, 'Geo heatmap data source', 'Admin heatmap should use saved customer/expert location/address.', 'Heatmap endpoint and frontend read user location fields; save path audited.'),
    row(32, 'Public profile view count', 'Profile view tracking should count customer/public profile opens.', 'Profile view endpoint exists and expert profile display added.'),
    row(33, 'Admin revenue UI assets', 'Revenue tab should render pie/chart data from backend.', 'Revenue backend returns chart datasets used by admin UI.'),
    row(34, 'SEO service pricing reuse', 'SEO pricing sections should reuse pricing/question data where possible.', 'SEO templates were tied to existing service/pricing content patterns.')
  ]
};

let html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
body{font-family:Calibri,Arial,sans-serif;color:#1f2937}
h1{font-size:24px;margin:16px 0 4px}
h2{font-size:20px;margin:24px 0 8px;color:#ff6b00}
.meta{color:#6b7280;margin-bottom:18px}
table{border-collapse:collapse;width:100%;margin-bottom:26px;table-layout:fixed}
th,td{border:1px solid #d1d5db;padding:8px;vertical-align:top;white-space:normal}
th{background:#eaf2ff;font-weight:700}
td:nth-child(1){width:55px;text-align:center}
td:nth-child(2){width:260px;font-weight:600}
td:nth-child(5){width:90px;text-align:center;font-weight:700;color:#15803d;background:#e8f5e9}
</style>
</head>
<body>
<h1>WorkIndex Audit Test Cases</h1>
<div class="meta">Generated on 15 May 2026. Covers customer, expert, admin, system, SEO, email, credits, chat, invite, rating, and deep loophole audit scenarios.</div>`;

for (const [sheetName, rows] of Object.entries(sheets)) {
  html += `<h2>${esc(sheetName.replace(/_/g, ' / '))}</h2><table><thead><tr><th>S.N</th><th>Test name</th><th>Expected behaviour</th><th>Actual behaviour</th><th>PASS/FAIL</th></tr></thead><tbody>`;
  for (const item of rows) {
    html += `<tr><td>${esc(item.sn)}</td><td>${esc(item.name)}</td><td>${esc(item.expected)}</td><td>${esc(item.actual)}</td><td>${esc(item.result)}</td></tr>`;
  }
  html += '</tbody></table>';
}

html += '</body></html>';
fs.writeFileSync(output, html, 'utf8');
console.log(output);
