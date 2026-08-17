import { Check, Activity, ShieldCheck, MapPin, Zap, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Feature() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex gap-4 py-20 lg:py-40 flex-col items-start">
          <div>
            <Badge>Platform</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-bold text-white">
              Smarter Sanitation Tracking
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-slate-400">
              Managing civic waste at scale is tough. SwachhLens automates the process with AI and real-time mapping.
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-2 items-start lg:grid-cols-3 gap-10">
              <div className="flex flex-row gap-6 w-full items-start">
                <Activity className="w-5 h-5 mt-1 text-teal-400" />
                <div className="flex flex-col gap-1 text-white">
                  <p className="font-semibold">Real-Time Dashboards</p>
                  <p className="text-slate-400 text-sm">
                    Live updates on incoming grievances directly from citizen devices.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <TrendingDown className="w-5 h-5 mt-1 text-teal-400" />
                <div className="flex flex-col gap-1 text-white">
                  <p className="font-semibold">Reduced SLAs</p>
                  <p className="text-slate-400 text-sm">
                    Automated priority sorting ensures urgent issues get cleared fast.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <MapPin className="w-5 h-5 mt-1 text-teal-400" />
                <div className="flex flex-col gap-1 text-white">
                  <p className="font-semibold">Geospatial Mapping</p>
                  <p className="text-slate-400 text-sm">
                    Pinpoint the exact location of waste dumps instantly.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 w-full items-start">
                <Zap className="w-5 h-5 mt-1 text-teal-400" />
                <div className="flex flex-col gap-1 text-white">
                  <p className="font-semibold">AI Automated Triage</p>
                  <p className="text-slate-400 text-sm">
                    Our AI models instantly classify and prioritize images of waste.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <ShieldCheck className="w-5 h-5 mt-1 text-teal-400" />
                <div className="flex flex-col gap-1 text-white">
                  <p className="font-semibold">Verified Proof</p>
                  <p className="text-slate-400 text-sm">
                    Before-and-after photo uploads prove the job was completed correctly.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-5 h-5 mt-1 text-teal-400" />
                <div className="flex flex-col gap-1 text-white">
                  <p className="font-semibold">Easy to use</p>
                  <p className="text-slate-400 text-sm">
                    Clean, simple interface for sanitation officers to manage workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };
