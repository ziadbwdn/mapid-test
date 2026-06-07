import KPICards from './KPICards'
import CategoryChart from './CategoryChart'
import SegmentChart from './SegmentChart'
import CostHistogram from './CostHistogram'
import HealthQuadrant from './HealthQuadrant'
import ProfitByCategory from './ProfitByCategory'
import MaintenanceHitlist from './MaintenanceHitlist'
import ProductTable from './ProductTable'
import CostVsProfitBoxplot from './CostVsProfitBoxplot'

export default function DashboardPage() {
  return (
    <div className="w-full min-h-screen pb-16 pt-6 px-6">
      <h1 className="font-headline-lg text-3xl font-bold text-primary mb-2">
        Analytics Overview
      </h1>
      <p className="text-on-surface-variant text-sm font-sans mb-10">
        Product performance and lifecycle tracking.
      </p>

      <KPICards />

      <section className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-12 lg:col-span-4">
          <CategoryChart />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <SegmentChart />
        </div>
      </section>

      <section className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-12 lg:col-span-7">
          <CostHistogram />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <HealthQuadrant />
        </div>
      </section>

      <section className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-12 lg:col-span-6">
          <ProfitByCategory />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <MaintenanceHitlist />
        </div>
      </section>

      <section className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-12">
          <CostVsProfitBoxplot />
        </div>
      </section>

      <section>
        <ProductTable />
      </section>
    </div>
  )
}
