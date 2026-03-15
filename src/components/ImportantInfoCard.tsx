import {Lightbulb, Check} from "lucide-react";

const INFO_ITEMS = [
  { bg: "bg-blue-50",   iconColor: "text-blue-600",   title: "Stay in Waiting Area",    body: "Please remain in the designated waiting area. You'll be notified when it's your turn." },
  { bg: "bg-purple-50", iconColor: "text-purple-600", title: "Bring Your ID",           body: "Have your national ID and health card ready when called." },
  { bg: "bg-orange-50", iconColor: "text-orange-600", title: "Notify Staff of Changes", body: "If your condition worsens while waiting, inform staff immediately." },
  { bg: "bg-green-50",  iconColor: "text-green-600",  title: "Notifications Enabled",   body: "You'll receive updates via app notifications and SMS." },
];

export default function ImportantInfoCard() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Important Information</h3>
          <p className="text-sm text-gray-500">Please note</p>
        </div>
      </div>
      <div className="space-y-3">
        {INFO_ITEMS.map(({ bg, iconColor, title, body }) => (
          <div key={title} className={`flex items-start gap-3 p-4 ${bg} rounded-xl`}>
            <Check className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
            <div>
              <div className="font-semibold text-gray-800 mb-1 text-sm">{title}</div>
              <p className="text-sm text-gray-600">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}