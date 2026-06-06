import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, BarChart2, Shield, CheckCircle2, Database, Zap, RefreshCw } from 'lucide-react'

export default function Home() {
  return (
    <div className="w-full bg-background">
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 border-b border-surface-border">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-12 left-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="z-10"
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs uppercase tracking-wider mb-6 font-bold">
              Geospatial Intelligence Platform
            </span>
            <h1 className="font-headline-lg text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-primary leading-tight lg:leading-[1.1] mb-6">
              Precision data mapping for the modern enterprise.
            </h1>
            <p className="text-on-surface-variant text-base lg:text-lg mb-8 max-w-xl font-sans">
              Unlock multi-dimensional insights with our advanced GIS engine.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/map"
                className="bg-primary text-on-primary hover:bg-neutral-800 transition-all duration-150 px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                Launch Map View
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="border border-surface-border bg-surface-container-lowest text-primary hover:bg-surface-container-low transition-all duration-150 px-8 py-3.5 rounded-lg font-bold cursor-pointer active:scale-95"
              >
                Explore Dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-border overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-secondary-fixed/20 to-primary-fixed/20 flex items-center justify-center">
                <Shield className="w-24 h-24 text-secondary/30" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-3xl font-bold tracking-tight text-primary mb-4">
            Core Ecosystem
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-sans">
            A unified suite of tools designed to transform raw spatial coordinates into actionable
            business intelligence.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl border border-surface-border shadow-sm flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="flex-1">
              <span className="p-3 bg-secondary-fixed/50 text-secondary rounded-xl inline-flex mb-4">
                <Shield className="w-6 h-6" />
              </span>
              <h3 className="font-headline-lg text-2xl font-bold text-primary mb-4">
                Immersive Map View
              </h3>
              <ul className="space-y-3 mb-6 font-sans">
                <li className="flex items-center gap-2 text-sm text-on-surface font-medium">
                  <CheckCircle2 className="w-4 h-4 text-data-positive shrink-0" />
                  Cluster visualization with custom styling
                </li>
                <li className="flex items-center gap-2 text-sm text-on-surface font-medium">
                  <CheckCircle2 className="w-4 h-4 text-data-positive shrink-0" />
                  Filter by category, segment, and search
                </li>
                <li className="flex items-center gap-2 text-sm text-on-surface font-medium">
                  <CheckCircle2 className="w-4 h-4 text-data-positive shrink-0" />
                  Product popup with health metrics
                </li>
              </ul>
              <Link
                to="/map"
                className="text-secondary font-bold text-sm flex items-center gap-1.5 hover:gap-2.5 transition-all"
              >
                Explore Maps <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest p-8 rounded-2xl border border-surface-border shadow-sm"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-label-sm text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Performance
                </div>
                <div className="font-stat-kpi text-3xl lg:text-4xl font-bold tracking-tight text-primary">
                  Real-time
                </div>
              </div>
              <div className="p-2.5 bg-data-positive/10 text-data-positive rounded-lg">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-on-surface-variant text-xs font-sans leading-relaxed">
              Low-latency spatial queries powered by PostGIS.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 lg:col-span-5 bg-primary-container text-white p-8 rounded-2xl border border-primary-container shadow-lg"
          >
            <span className="p-3 bg-white/10 rounded-xl inline-flex text-secondary-container mb-4">
              <BarChart2 className="w-6 h-6" />
            </span>
            <h3 className="font-headline-lg text-2xl font-bold mb-4">Analytics Dashboard</h3>
            <p className="text-white/80 text-sm font-sans mb-8 leading-relaxed">
              KPI cards, charts, and product tables with engineered metrics.
            </p>
            <Link
              to="/dashboard"
              className="text-secondary-fixed-dim hover:text-white font-bold text-sm flex items-center gap-1.5 mt-8"
            >
              Analyze Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-8 rounded-2xl border border-surface-border shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
              <div>
                <h3 className="font-headline-lg text-2xl font-bold text-primary mb-4">
                  Native Integrations
                </h3>
                <p className="text-on-surface-variant text-sm font-sans mb-6 leading-relaxed">
                  Built on PostgreSQL + PostGIS for robust spatial data management.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['PostgreSQL', 'PostGIS', 'GeoJSON', 'MapLibre'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-surface-container-low rounded-lg border border-surface-border font-label-sm text-xs font-semibold text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative h-44 bg-surface-container rounded-xl overflow-hidden flex items-center justify-center">
                <div className="w-14 h-14 bg-white/95 rounded-full shadow-lg flex items-center justify-center border border-surface-border">
                  <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="font-headline-lg text-3xl lg:text-4xl font-bold text-primary mb-6">
          Ready to see your data in a new dimension?
        </h2>
        <p className="text-on-surface-variant text-base lg:text-lg mb-10 font-sans max-w-2xl mx-auto">
          Explore product distribution across Java with our interactive WebGIS and analytics dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/map"
            className="w-full sm:w-auto bg-secondary text-white hover:bg-on-secondary-container transition-all px-10 py-4 rounded-lg font-bold shadow-md cursor-pointer active:scale-95 text-center"
          >
            Launch Map View
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto border border-surface-border bg-white text-primary hover:bg-surface-container transition-all px-10 py-4 rounded-lg font-bold cursor-pointer active:scale-95 text-center"
          >
            Explore Dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}
