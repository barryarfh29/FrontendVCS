export const TEMPLATE_DEFAULTS: Record<string, string> = {
  welcome: `<h4>CHOOSE A TALENT</h4><p>Select a talent below to start your private session.</p><ul><li><p>Private one-on-one live session</p></li><li><p>Easy payment via QRIS - TNG / Maybank / Boost supported</p></li><li><p>Timer starts only after you join</p></li></ul>`,
  payment: `<h2>QRIS Invoice</h2><h4>Order Details</h4><table><tbody><tr><td><p><strong>Invoice ID</strong></p></td><td><p>{invoice_id}</p></td></tr><tr><td><p><strong>Talent</strong></p></td><td><p>{talent_name}</p></td></tr><tr><td><p><strong>Duration</strong></p></td><td><p>{duration} minutes</p></td></tr></tbody></table><h4>Payment</h4><table><tbody><tr><td><p><strong>Total</strong></p></td><td><p><strong>{nominal}</strong></p></td></tr><tr><td><p><strong>Method</strong></p></td><td><p>QRIS / Cross-border QR</p></td></tr></tbody></table><p>Scan the QR code above to pay. Payment is detected automatically.</p><p>Malaysian e-wallets (TNG, Maybank, Boost) can scan the same code.</p>`,
  paid: `<h4>PAYMENT RECEIVED</h4><p>Your payment has been confirmed.</p><p>Please send a <b>screenshot of your payment proof</b> for verification, or tap <b>Skip</b> to continue.</p>`,
  connecting: `<h4>CONNECTING TO TALENT</h4><p>Contacting <b>{talent_name}</b> to serve you...</p><p>Please wait a moment.</p>`,
  session_ready: `<h4>SESSION READY</h4><p><b>Talent:</b> {talent_name}</p><p><b>Duration:</b> {duration} minutes</p><p><b>{talent_name}</b> is ready for you. The timer starts when you join the voice chat.</p>`,
  session_end: `<h4>SESSION ENDED</h4><p>Thank you for using our service!</p><p>Send /start whenever you want a new session.</p>`,
  talent_full: `<h4>{talent_name} IS BUSY</h4><p>Currently serving another customer.</p><p>Tap <b>Enable Notifications</b> to get notified when this talent is available again.</p>`,
  talent_detail: `<h4>{talent_name}</h4><p>{desc}</p><table><tbody><tr><td><p><strong>Price</strong></p></td><td><p><strong>{price}</strong></p></td></tr><tr><td><p><strong>Duration</strong></p></td><td><p>{duration} minutes</p></td></tr></tbody></table><p>Tap <b>Order</b> to continue.</p>`,
  loading_1: `<p>⏳ Loading...</p>`,
  loading_2: `<p>✅ Found <b>{count}</b> talents available</p>`,
  loading_3: `<p>🎯 Preparing menu... ({count} talents)</p>`,
};

// Preset siap pakai — klik untuk memuat contoh ke editor.
// Aturan aman untuk Telegram: tabel sederhana 2 kolom, TANPA merge/nested table.
export const TEMPLATE_PRESETS: Record<
  string,
  { name: string; html: string }[]
> = {
  welcome: [
    {
      name: "Simple",
      html: `<h4>CHOOSE A TALENT</h4><p>Select the talent you want for a private session.</p>`,
    },
    {
      name: "Default",
      html: `<h4>CHOOSE A TALENT</h4><p>Select a talent below to start your private session.</p><ul><li><p>Private one-on-one live session</p></li><li><p>Easy payment via QRIS - TNG / Maybank / Boost supported</p></li><li><p>Timer starts only after you join</p></li></ul>`,
    },
    {
      name: "Tabel",
      html: `<h4>CHOOSE A TALENT</h4><p>Select a talent below to start.</p><table><tbody><tr><td><p><strong>Session</strong></p></td><td><p>Private one-on-one</p></td></tr><tr><td><p><strong>Payment</strong></p></td><td><p>QRIS / TNG / Maybank / Boost</p></td></tr><tr><td><p><strong>Timer</strong></p></td><td><p>Starts after you join</p></td></tr></tbody></table>`,
    },
    {
      name: "Lengkap",
      html: `<h2>WELCOME</h2><p>Thank you for visiting our service!</p><h4>HOW IT WORKS</h4><ol><li><p>Choose a talent below</p></li><li><p>Pick your session duration</p></li><li><p>Pay via QRIS (Malaysian e-wallets supported)</p></li><li><p>Join the voice chat and enjoy</p></li></ol><p>Pick your talent now!</p>`,
    },
  ],
  payment: [
    {
      name: "Simple",
      html: `<h2>QRIS Invoice</h2><p><strong>Invoice ID:</strong> {invoice_id}</p><p><strong>Talent:</strong> {talent_name}</p><p><strong>Duration:</strong> {duration} minutes</p><p><strong>Total:</strong> {nominal}</p><p>Scan the QRIS code below to pay. Payment is detected automatically.</p>`,
    },
    {
      name: "1 Tabel",
      html: `<h2>QRIS Invoice</h2><table><tbody><tr><th><p>Detail</p></th><th><p>Value</p></th></tr><tr><td><p>Invoice ID</p></td><td><p>{invoice_id}</p></td></tr><tr><td><p>Talent</p></td><td><p>{talent_name}</p></td></tr><tr><td><p>Duration</p></td><td><p>{duration} minutes</p></td></tr><tr><td><p>Total</p></td><td><p><strong>{nominal}</strong></p></td></tr></tbody></table><p>Scan the QRIS code below to pay. Payment is detected automatically.</p>`,
    },
    {
      name: "2 Tabel Terpisah",
      html: `<h2>QRIS Invoice</h2><h4>Order Details</h4><table><tbody><tr><td><p><strong>Invoice ID</strong></p></td><td><p>{invoice_id}</p></td></tr><tr><td><p><strong>Talent</strong></p></td><td><p>{talent_name}</p></td></tr><tr><td><p><strong>Duration</strong></p></td><td><p>{duration} minutes</p></td></tr></tbody></table><h4>Payment</h4><table><tbody><tr><td><p><strong>Total</strong></p></td><td><p><strong>{nominal}</strong></p></td></tr><tr><td><p><strong>Method</strong></p></td><td><p>QRIS / Cross-border QR</p></td></tr></tbody></table><p>Scan the QR code above to pay. Payment is detected automatically.</p><p>Malaysian e-wallets (TNG, Maybank, Boost) can scan the same code.</p>`,
    },
    {
      name: "Lengkap",
      html: `<h2>QRIS Invoice</h2><h4>Order Details</h4><table><tbody><tr><td><p><strong>Invoice ID</strong></p></td><td><p>{invoice_id}</p></td></tr><tr><td><p><strong>Talent</strong></p></td><td><p>{talent_name}</p></td></tr><tr><td><p><strong>Duration</strong></p></td><td><p>{duration} minutes</p></td></tr></tbody></table><h4>Payment</h4><table><tbody><tr><td><p><strong>Total</strong></p></td><td><p><strong>{nominal}</strong></p></td></tr><tr><td><p><strong>Method</strong></p></td><td><p>QRIS / Cross-border QR</p></td></tr></tbody></table><h4>How to Pay</h4><ol><li><p>Open your banking or e-wallet app</p></li><li><p>Scan the QR code above</p></li><li><p>Payment is detected automatically</p></li></ol><p>Malaysian e-wallets (TNG, Maybank, Boost) can scan the same code.</p>`,
    },
  ],
  paid: [
    {
      name: "Simple",
      html: `<h4>PAYMENT RECEIVED</h4><p>Your payment has been received. Thank you!</p>`,
    },
    {
      name: "Default",
      html: `<h4>PAYMENT RECEIVED</h4><p>Your payment has been confirmed.</p><p>Please send a <b>screenshot of your payment proof</b> for verification, or tap <b>Skip</b> to continue.</p>`,
    },
    {
      name: "Lengkap",
      html: `<h4>PAYMENT RECEIVED</h4><p>Your payment has been <b>confirmed</b>. Thank you!</p><h4>NEXT STEP</h4><ul><li><p>Send a screenshot of your payment proof, or</p></li><li><p>Tap <b>Skip</b> to continue right away</p></li></ul><p>We will connect you to the talent shortly.</p>`,
    },
  ],
  connecting: [
    {
      name: "Simple",
      html: `<h4>CONNECTING...</h4><p>Please wait a moment.</p>`,
    },
    {
      name: "Default",
      html: `<h4>CONNECTING TO TALENT</h4><p>Contacting <b>{talent_name}</b> to serve you...</p><p>Please wait a moment.</p>`,
    },
    {
      name: "Lengkap",
      html: `<h4>CONNECTING TO TALENT</h4><p>Contacting <b>{talent_name}</b> to serve you...</p><ul><li><p>This usually takes less than a minute</p></li><li><p>You will get an invite link once the room is ready</p></li></ul>`,
    },
  ],
  session_ready: [
    {
      name: "Simple",
      html: `<h4>SESSION READY</h4><p><b>{talent_name}</b> is ready to serve you for {duration} minutes.</p><p>The timer starts when you join the voice chat.</p>`,
    },
    {
      name: "Default",
      html: `<h4>SESSION READY</h4><p><b>Talent:</b> {talent_name}</p><p><b>Duration:</b> {duration} minutes</p><p><b>{talent_name}</b> is ready for you. The timer starts when you join the voice chat.</p>`,
    },
    {
      name: "Tabel",
      html: `<h4>SESSION READY</h4><table><tbody><tr><td><p><strong>Talent</strong></p></td><td><p>{talent_name}</p></td></tr><tr><td><p><strong>Duration</strong></p></td><td><p>{duration} minutes</p></td></tr></tbody></table><p>The timer starts when you join the voice chat.</p>`,
    },
    {
      name: "Lengkap",
      html: `<h4>SESSION READY</h4><p><b>Talent:</b> {talent_name}</p><p><b>Duration:</b> {duration} minutes</p><h4>RULES</h4><ul><li><p>The timer starts when you join the voice chat</p></li><li><p>Do not share the invite link</p></li><li><p>Recording is not allowed</p></li></ul><p>Enjoy your session!</p>`,
    },
  ],
  session_end: [
    {
      name: "Simple",
      html: `<h4>SESSION ENDED</h4><p>Thank you for using our service!</p>`,
    },
    {
      name: "Default",
      html: `<h4>SESSION ENDED</h4><p>Thank you for using our service!</p><p>Send /start whenever you want a new session.</p>`,
    },
    {
      name: "Lengkap",
      html: `<h4>SESSION ENDED</h4><p>Your session has ended. Thank you for using our service!</p><ul><li><p>Send /start to book a new session</p></li><li><p>Enable notifications to know when your favorite talent is online</p></li></ul><p>See you again!</p>`,
    },
  ],
  talent_full: [
    {
      name: "Simple",
      html: `<h4>{talent_name} IS BUSY</h4><p>Please try again later.</p>`,
    },
    {
      name: "Default",
      html: `<h4>{talent_name} IS BUSY</h4><p>Currently serving another customer.</p><p>Tap <b>Enable Notifications</b> to get notified when this talent is available again.</p>`,
    },
    {
      name: "Lengkap",
      html: `<h4>{talent_name} IS BUSY</h4><p>Currently serving another customer.</p><ul><li><p>Tap <b>Enable Notifications</b> to get notified when available</p></li><li><p>Or choose another talent from the list</p></li></ul>`,
    },
  ],
  talent_detail: [
    {
      name: "Simple",
      html: `<h4>{talent_name}</h4><p>{desc}</p><p><strong>Price:</strong> {price}</p><p><strong>Duration:</strong> {duration} minutes</p>`,
    },
    {
      name: "Default",
      html: `<h4>{talent_name}</h4><p>{desc}</p><table><tbody><tr><td><p><strong>Price</strong></p></td><td><p><strong>{price}</strong></p></td></tr><tr><td><p><strong>Duration</strong></p></td><td><p>{duration} minutes</p></td></tr></tbody></table><p>Tap <b>Order</b> to continue.</p>`,
    },
    {
      name: "Lengkap",
      html: `<h2>{talent_name}</h2><p>{desc}</p><h4>SESSION INFO</h4><table><tbody><tr><td><p><strong>Price</strong></p></td><td><p><strong>{price}</strong></p></td></tr><tr><td><p><strong>Duration</strong></p></td><td><p>{duration} minutes</p></td></tr><tr><td><p><strong>Payment</strong></p></td><td><p>QRIS / TNG / Maybank / Boost</p></td></tr></tbody></table><ul><li><p>Private one-on-one session</p></li><li><p>Timer starts after you join</p></li></ul><p>Tap <b>Order</b> to continue.</p>`,
    },
  ],
};

export const TEMPLATE_META: Record<
  string,
  { label: string; description: string; variables: string[]; category: string }
> = {
  // Bot - Customer Flow
  welcome: {
    label: "Halaman Pilih Talent",
    description: "Halaman pilih talent",
    variables: [],
    category: "bot_customer",
  },
  talent_detail: {
    label: "Detail Talent",
    description: "Detail talent ({desc} diisi dari admin bot)",
    variables: ["{talent_name}", "{desc}", "{price}", "{duration}"],
    category: "bot_customer",
  },
  talent_full: {
    label: "Talent Full/Busy",
    description: "Talent full",
    variables: ["{talent_name}"],
    category: "bot_customer",
  },
  // Bot - Pembayaran
  payment: {
    label: "Invoice QRIS",
    description: "Invoice QRIS",
    variables: ["{invoice_id}", "{talent_name}", "{duration}", "{nominal}"],
    category: "bot_payment",
  },
  paid: {
    label: "Pembayaran Diterima",
    description: "Pembayaran diterima",
    variables: [],
    category: "bot_payment",
  },
  connecting: {
    label: "Menghubungi Talent",
    description: "Menghubungi talent",
    variables: ["{talent_name}"],
    category: "bot_payment",
  },
  // Bot - Session
  session_ready: {
    label: "Sesi Siap",
    description: "Sesi siap",
    variables: ["{talent_name}", "{duration}"],
    category: "bot_session",
  },
  session_end: {
    label: "Sesi Berakhir",
    description: "Sesi berakhir",
    variables: [],
    category: "bot_session",
  },
  channel_greeting: {
    label: "Sapaan Channel Private",
    description: "Pesan sapaan di channel private session",
    variables: ["{talent_name}", "{duration}"],
    category: "bot_session",
  },
  join_warning: {
    label: "Peringatan Belum Join VC",
    description: "Reminder jika customer belum join voice chat",
    variables: ["{remaining}"],
    category: "bot_session",
  },
  // Bot - Loading
  loading_1: {
    label: "Loading Step 1",
    description: "Pesan awal saat user /start",
    variables: [],
    category: "bot_loading",
  },
  loading_2: {
    label: "Loading Step 2",
    description: "Setelah cek talent tersedia",
    variables: ["{count}"],
    category: "bot_loading",
  },
  loading_3: {
    label: "Loading Step 3",
    description: "Sebelum menu muncul",
    variables: ["{count}"],
    category: "bot_loading",
  },
  // Bot - Promo & Social
  promo_prompt: {
    label: "Prompt Promo Code",
    description: "Pesan muncul saat customer diminta input promo code",
    variables: [],
    category: "bot_promo",
  },
  promo_applied: {
    label: "Konfirmasi Promo",
    description: "Pesan konfirmasi promo berhasil",
    variables: ["{code}", "{discount}"],
    category: "bot_promo",
  },
  fake_buyer: {
    label: "Notifikasi Fake Buyer",
    description: "Template pesan notifikasi social proof",
    variables: ["{username}"],
    category: "bot_promo",
  },
  // Userbot - Order Flow
  ub_menu: {
    label: "Menu Talent",
    description: "Daftar talent yang tersedia di userbot CS",
    variables: ["{talent_list}"],
    category: "userbot_order",
  },
  ub_package: {
    label: "Pilih Paket",
    description: "List paket durasi setelah customer pilih talent",
    variables: ["{talent_name}", "{package_list}", "{package_count}"],
    category: "userbot_order",
  },
  ub_confirm: {
    label: "Konfirmasi Order",
    description: "Konfirmasi sebelum pembayaran",
    variables: ["{talent_name}", "{price}", "{duration}"],
    category: "userbot_order",
  },
  ub_invoice: {
    label: "Invoice Pembayaran",
    description: "Invoice QRIS di userbot",
    variables: ["{talent_name}", "{nominal}", "{duration}"],
    category: "userbot_order",
  },
  ub_paid: {
    label: "Pembayaran Berhasil",
    description: "Konfirmasi pembayaran berhasil di userbot",
    variables: ["{talent_name}", "{duration}"],
    category: "userbot_order",
  },
  ub_cancelled: {
    label: "Order Dibatalkan",
    description: "Pesan saat order dibatalkan",
    variables: ["{talent_name}"],
    category: "userbot_order",
  },
  ub_unavailable: {
    label: "Talent Tidak Tersedia",
    description: "Pesan saat talent tidak online/available",
    variables: ["{talent_name}", "{status}"],
    category: "userbot_order",
  },
  ub_expired: {
    label: "Invoice Expired",
    description: "Pesan saat invoice expired belum dibayar",
    variables: ["{talent_name}", "{nominal}"],
    category: "userbot_order",
  },
};
