
import {Lightbulb} from "lucide-react";

const WHAT_NEXT_STEPS = [
  { n: 1, title: "Receive Queue Number", body: "You'll get a unique queue ID and your position" },
  { n: 2, title: "Track Your Progress", body: "View real-time updates on your queue position" },
  { n: 3, title: "Get Notified", body: "Receive alerts when it's almost your turn" },
  { n: 4, title: "See Healthcare Provider", body: "Be ready when called for your appointment" },
];


export default function WhatNextCard() {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb size={22} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">What Happens Next?</h3>
          <p className="text-sm text-gray-500">After you join the queue</p>
        </div>
      </div>

      <div className="space-y-3">
        {WHAT_NEXT_STEPS.map((s) => (
          <div key={s.n} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "var(--color-juno-green)" }}
            >
              <span className="text-white font-bold text-sm">{s.n}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm mb-0.5">{s.title}</p>
              <p className="text-xs text-gray-500">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}