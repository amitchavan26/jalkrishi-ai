import React from "react";
import { Link } from "react-router-dom";
import RatioGauge from "../components/RatioGauge";
import { suitabilityBadge, suitabilityLabel } from "../labels";

export default function Landing() {
  return (
    <div className="app-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass flex flex-wrap items-center justify-between px-6 py-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z" />
          </svg>
          <span className="glow-text text-xl font-extrabold">JalKrishi AI</span>
        </div>
        <nav className="flex flex-wrap items-center gap-4 my-2 sm:my-0">
          <a href="#how" className="pill">
            How it works
          </a>
          <a href="#features" className="pill">
            Features
          </a>
          <a href="#classes" className="pill">
            Results explained
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="pill">
            Log in
          </Link>
          <Link to="/register" className="btn">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden py-16 px-6 max-w-6xl mx-auto">
        {/* Decorative blurred circles behind hero */}
        <div
          aria-hidden="true"
          className="absolute -top-10 left-10 w-72 h-72 bg-sky-300/40 blur-3xl pointer-events-none rounded-full"
        />
        <div
          aria-hidden="true"
          className="absolute top-20 right-10 w-80 h-80 bg-blue-400/30 blur-3xl pointer-events-none rounded-full"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
              Can I grow this <span className="glow-text">crop?</span>
            </h1>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              JalKrishi AI compares the water your farm has with the water a crop
              needs, and gives you a clear answer before you sow.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn">
                Check my farm
              </Link>
              <Link to="/login" className="btn btn-ghost">
                I already have an account
              </Link>
            </div>
          </div>
          <div>
            <div className="glass lift p-6 relative">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Example only
              </div>
              <div className="text-lg font-bold text-slate-900 mb-4">
                Rice, 30 days, 2.5 ha
              </div>
              <div className="flex justify-center mb-4">
                <RatioGauge ratio={0.27} />
              </div>
              <div className="text-center mb-4">
                <span
                  style={{
                    backgroundColor: suitabilityBadge.NOT_RECOMMENDED.bg,
                    color: suitabilityBadge.NOT_RECOMMENDED.fg,
                  }}
                  className="px-3 py-1 rounded-full text-sm font-semibold inline-block"
                >
                  {suitabilityLabel.NOT_RECOMMENDED}
                </span>
              </div>
              <p className="text-sm text-slate-600 text-center">
                The crop needs about 4.1 million litres; the farm has about 1.1
                million.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-24 py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass lift p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              1. Add your farm
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Pick the place on the map or search it by name. Enter the area in
              hectares or acres and the water you have per day.
            </p>
          </div>
          <div className="glass lift p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              2. Choose a crop
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Select a crop and a period of 30, 60 or 90 days.
            </p>
          </div>
          <div className="glass lift p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              3. Read the answer
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Get a clear result from Excellent to Not recommended, with advice
              in plain words and a chart of water supply against demand.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center">
          What you get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass lift p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Water budget
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Crop water need from temperature and growth stage, compared with
              your rain, tank and groundwater.
            </p>
          </div>
          <div className="glass lift p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Live weather
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Uses the latest forecast, and falls back to typical values with a
              lower confidence if it is not available.
            </p>
          </div>
          <div className="glass lift p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Compare crops
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Check several crops on the same farm and see which fits your water
              best.
            </p>
          </div>
          <div className="glass lift p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Alerts</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Get a warning when a crop does not have enough water.
            </p>
          </div>
          <div className="glass lift p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Water helper
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Work out litres per day from a bucket test or from the size of
              your tank.
            </p>
          </div>
          <div className="glass lift p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Second opinion
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              A machine-learning check sits next to the rule-based result.
            </p>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section id="classes" className="scroll-mt-24 py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 text-center">
          How to read the result
        </h2>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-10">
          The ratio is the water available divided by the water the crop needs
          over the period you chose.
        </p>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="glass lift p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span
              style={{
                backgroundColor: suitabilityBadge.EXCELLENT.bg,
                color: suitabilityBadge.EXCELLENT.fg,
              }}
              className="px-3 py-1 rounded-full text-sm font-semibold shrink-0"
            >
              {suitabilityLabel.EXCELLENT}
            </span>
            <span className="text-slate-700 text-sm sm:text-base">
              Ratio 1.0 or more: the water covers the crop&apos;s need.
            </span>
          </div>

          <div className="glass lift p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span
              style={{
                backgroundColor: suitabilityBadge.GOOD.bg,
                color: suitabilityBadge.GOOD.fg,
              }}
              className="px-3 py-1 rounded-full text-sm font-semibold shrink-0"
            >
              {suitabilityLabel.GOOD}
            </span>
            <span className="text-slate-700 text-sm sm:text-base">
              Ratio 0.8 to 1.0: a small shortfall.
            </span>
          </div>

          <div className="glass lift p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span
              style={{
                backgroundColor: suitabilityBadge.RISKY.bg,
                color: suitabilityBadge.RISKY.fg,
              }}
              className="px-3 py-1 rounded-full text-sm font-semibold shrink-0"
            >
              {suitabilityLabel.RISKY}
            </span>
            <span className="text-slate-700 text-sm sm:text-base">
              Ratio 0.6 to 0.8: plan extra water.
            </span>
          </div>

          <div className="glass lift p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span
              style={{
                backgroundColor: suitabilityBadge.NOT_RECOMMENDED.bg,
                color: suitabilityBadge.NOT_RECOMMENDED.fg,
              }}
              className="px-3 py-1 rounded-full text-sm font-semibold shrink-0"
            >
              {suitabilityLabel.NOT_RECOMMENDED}
            </span>
            <span className="text-slate-700 text-sm sm:text-base">
              Ratio below 0.6: the farm does not have enough water.
            </span>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="glass lift p-12 text-center max-w-3xl mx-auto rounded-3xl">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
            Ready to check your farm?
          </h2>
          <Link to="/register" className="btn">
            Create an account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-500 text-sm space-y-2 border-t border-slate-200/60 max-w-6xl mx-auto">
        <div>© 2026 JalKrishi AI</div>
        <div>
          Weather data from Open-Meteo. Maps from OpenStreetMap contributors.
        </div>
        <div>Results are planning estimates, not a guarantee.</div>
      </footer>
    </div>
  );
}
