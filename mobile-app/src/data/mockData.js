export const categoriesConfig = {
  overflowing_bin: {
    label: 'Overflowing Bin',
    shortLabel: 'Bin Overflow',
    color: '#f59e0b',
    icon: 'trash-2',
    description: 'Public municipal garbage container filled past capacity'
  },
  garbage_dump: {
    label: 'Illegal Garbage Dump',
    shortLabel: 'Garbage Dump',
    color: '#ef4444',
    icon: 'alert-triangle',
    description: 'Open pile of unsorted municipal solid waste'
  },
  plastic_waste: {
    label: 'Plastic Waste',
    shortLabel: 'Plastic Waste',
    color: '#06b6d4',
    icon: 'package',
    description: 'Accumulation of single-use plastics & discarded polybags'
  },
  construction_debris: {
    label: 'Construction Debris',
    shortLabel: 'C&D Debris',
    color: '#8b5cf6',
    icon: 'layers',
    description: 'Bricks, concrete rubble, or excavate blocking public path'
  },
  organic_waste: {
    label: 'Organic Market Waste',
    shortLabel: 'Organic Waste',
    color: '#10b981',
    icon: 'leaf',
    description: 'Decomposing food items and green market waste'
  },
  e_waste: {
    label: 'Electronic Waste',
    shortLabel: 'E-Waste',
    color: '#3b82f6',
    icon: 'cpu',
    description: 'Discarded electronics, circuit boards, batteries'
  },
  hazardous_waste: {
    label: 'Hazardous / Medical',
    shortLabel: 'Hazardous',
    color: '#dc2626',
    icon: 'shield-alert',
    description: 'Chemical containers, syringes, or toxic materials'
  },
  drain_blockage: {
    label: 'Drain Blockage',
    shortLabel: 'Blocked Drain',
    color: '#d97706',
    icon: 'droplets',
    description: 'Clogged storm drain or open sewer overflow'
  }
};

export const volumeConfig = {
  small: { label: 'Small (< 1 Bag)', badgeBg: '#1e293b', badgeText: '#94a3b8' },
  medium: { label: 'Medium (1-3 Bags)', badgeBg: '#1e293b', badgeText: '#cbd5e1' },
  large: { label: 'Large (Cart Load)', badgeBg: '#1e293b', badgeText: '#f8fafc' },
  very_large: { label: 'Very Large (Truck Load Needed)', badgeBg: '#312e81', badgeText: '#a5b4fc' }
};

export const statusConfig = {
  submitted: {
    label: 'Submitted',
    color: '#3b82f6',
    bgLight: '#1e3a8a20',
    borderColor: '#3b82f640',
    description: 'Received by Municipal Portal'
  },
  in_progress: {
    label: 'In Progress',
    color: '#f97316',
    bgLight: '#7c2d1220',
    borderColor: '#f9731640',
    description: 'Sanitation Crew Dispatched'
  },
  resolved: {
    label: 'Resolved',
    color: '#10b981',
    bgLight: '#064e3b20',
    borderColor: '#10b98140',
    description: 'Cleanup Completed & Verified'
  }
};

export const initialMockReports = [
  {
    id: "RPT-2026-8801",
    image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    category: "overflowing_bin",
    volume: "large",
    status: "submitted",
    gps: { lat: 25.6093, lng: 85.1235 },
    address: "Boring Road Crossing, Patna",
    timestamp: "2026-08-13T10:15:00Z",
    comment: "Commercial street bin spilling onto the sidewalk. Blocking pedestrian path.",
    ai_confidence: 96,
    timeline: [
      { step: "Submitted", time: "Aug 13, 10:15 AM", done: true },
      { step: "Acknowledged by Ward 14 Officer", time: "Aug 13, 10:22 AM", done: true },
      { step: "In Progress (Crew Dispatched)", time: "Pending", done: false },
      { step: "Resolved & Verified", time: "Pending", done: false }
    ]
  },
  {
    id: "RPT-2026-8794",
    image_url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
    category: "garbage_dump",
    volume: "very_large",
    status: "in_progress",
    gps: { lat: 25.6110, lng: 85.1441 },
    address: "Gandhi Maidan South Gate, Patna",
    timestamp: "2026-08-13T08:30:00Z",
    comment: "Large uncollected trash pile near public park entrance. Needs JCB loader.",
    ai_confidence: 94,
    timeline: [
      { step: "Submitted", time: "Aug 13, 08:30 AM", done: true },
      { step: "Acknowledged by Central Control", time: "Aug 13, 08:45 AM", done: true },
      { step: "In Progress (JCB Crew Assigned)", time: "Aug 13, 09:10 AM", done: true },
      { step: "Resolved & Verified", time: "Pending", done: false }
    ]
  },
  {
    id: "RPT-2026-8750",
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    category: "drain_blockage",
    volume: "medium",
    status: "resolved",
    gps: { lat: 25.5940, lng: 85.1610 },
    address: "Kankarbagh Main Road, Patna",
    timestamp: "2026-08-11T14:20:00Z",
    comment: "Storm drain inlet blocked by plastic bags causing water stagnation.",
    ai_confidence: 91,
    timeline: [
      { step: "Submitted", time: "Aug 11, 02:20 PM", done: true },
      { step: "Acknowledged", time: "Aug 11, 02:35 PM", done: true },
      { step: "In Progress", time: "Aug 11, 03:00 PM", done: true },
      { step: "Resolved", time: "Aug 11, 04:45 PM", done: true }
    ]
  },
  {
    id: "RPT-2026-8712",
    image_url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    category: "plastic_waste",
    volume: "small",
    status: "resolved",
    gps: { lat: 25.6170, lng: 85.0890 },
    address: "Patliputra Colony Road No 3, Patna",
    timestamp: "2026-08-10T11:05:00Z",
    comment: "Discarded plastic packaging strewn across residential corner.",
    ai_confidence: 89,
    timeline: [
      { step: "Submitted", time: "Aug 10, 11:05 AM", done: true },
      { step: "Acknowledged", time: "Aug 10, 11:20 AM", done: true },
      { step: "In Progress", time: "Aug 10, 11:45 AM", done: true },
      { step: "Resolved", time: "Aug 10, 01:10 PM", done: true }
    ]
  },
  {
    id: "RPT-2026-8690",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    category: "construction_debris",
    volume: "large",
    status: "submitted",
    gps: { lat: 25.6020, lng: 85.1380 },
    address: "Exhibition Road Lane 4, Patna",
    timestamp: "2026-08-12T17:40:00Z",
    comment: "Concrete rubble left on side of road after building renovation.",
    ai_confidence: 93,
    timeline: [
      { step: "Submitted", time: "Aug 12, 05:40 PM", done: true },
      { step: "Acknowledged by Central Control", time: "Aug 12, 06:10 PM", done: true },
      { step: "In Progress", time: "Pending", done: false },
      { step: "Resolved", time: "Pending", done: false }
    ]
  },
  {
    id: "RPT-2026-8642",
    image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    category: "organic_waste",
    volume: "medium",
    status: "resolved",
    gps: { lat: 25.5970, lng: 85.0930 },
    address: "Ashiana Nagar Phase 1 Market, Patna",
    timestamp: "2026-08-09T09:15:00Z",
    comment: "Vegetable market refuse pilling up in alleyway.",
    ai_confidence: 92,
    timeline: [
      { step: "Submitted", time: "Aug 09, 09:15 AM", done: true },
      { step: "Acknowledged", time: "Aug 09, 09:30 AM", done: true },
      { step: "In Progress", time: "Aug 09, 10:00 AM", done: true },
      { step: "Resolved", time: "Aug 09, 11:30 AM", done: true }
    ]
  },
  {
    id: "RPT-2026-8600",
    image_url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80",
    category: "e_waste",
    volume: "small",
    status: "submitted",
    gps: { lat: 25.6200, lng: 85.1200 },
    address: "Rajendra Nagar Overbridge Near Gate 1, Patna",
    timestamp: "2026-08-13T06:50:00Z",
    comment: "Old computer monitor chassis and wires dumped under bridge.",
    ai_confidence: 95,
    timeline: [
      { step: "Submitted", time: "Aug 13, 06:50 AM", done: true },
      { step: "Acknowledged", time: "Pending", done: false },
      { step: "In Progress", time: "Pending", done: false },
      { step: "Resolved", time: "Pending", done: false }
    ]
  }
];

export const initialNotifications = [
  {
    id: "NOTIF-01",
    report_id: "RPT-2026-8750",
    title: "Report Resolved! 🎉",
    message: "Your report for Drain Blockage at Kankarbagh Main Road has been cleared and verified by Ward 22 Sanitation Team.",
    timestamp: "Aug 11, 04:45 PM",
    unread: false,
    icon: "check-circle",
    type: "resolved"
  },
  {
    id: "NOTIF-02",
    report_id: "RPT-2026-8794",
    title: "Crew Dispatched 🚚",
    message: "A heavy compactor unit has been assigned to your report near Gandhi Maidan South Gate.",
    timestamp: "Aug 13, 09:10 AM",
    unread: true,
    icon: "truck",
    type: "in_progress"
  },
  {
    id: "NOTIF-03",
    report_id: "RPT-2026-8801",
    title: "Report Acknowledged 📋",
    message: "Municipal control room received your report for Boring Road Crossing.",
    timestamp: "Aug 13, 10:22 AM",
    unread: true,
    icon: "clock",
    type: "submitted"
  },
  {
    id: "NOTIF-04",
    report_id: "RPT-2026-8712",
    title: "Eco Impact Points Earned ⭐",
    message: "You earned +50 Civic Eco Points for reporting plastic waste in Patliputra Colony!",
    timestamp: "Aug 10, 01:10 PM",
    unread: false,
    icon: "award",
    type: "reward"
  }
];
