import { getMyDealerCustomersService } from '@/modules/customers/services/get-my-dealer-customers.service'
import { getVehiclesForCustomerService } from '@/modules/vehicles/services/get-vehicles-for-customer.service'
import type { DealerTireSetOverviewRow } from '../types'
import { listVehicleTireSetsService } from './tire-set.service'

const CUSTOMER_PAGE_SIZE = 50

/**
 * يجمّع كل مجموعات الإطارات لكل مركبات كل عملاء المورّد الحالي (صفحات عملاء + مركبات + tire-sets).
 * لا يوجد حالياً endpoint واحد في الواجهة لذلك؛ يعتمد على نفس الـ APIs المستخدمة في بقية التطبيق.
 */
export async function fetchDealerTireSetsOverview(): Promise<DealerTireSetOverviewRow[]> {
  const rows: DealerTireSetOverviewRow[] = []

  let page = 0
  let last = false

  while (!last) {
    const customerPage = await getMyDealerCustomersService({
      page,
      size: CUSTOMER_PAGE_SIZE,
      sortBy: 'lastName',
      direction: 'asc',
      includeArchived: false,
    })

    for (const c of customerPage.content) {
      if (c.archived) continue

      const vehicles = await getVehiclesForCustomerService(c.id)
      const customerDisplayName = `${c.firstName} ${c.lastName}`.trim()

      for (const v of vehicles) {
        const sets = await listVehicleTireSetsService(c.id, v.id)
        for (const s of sets) {
          rows.push({
            ...s,
            dealerCustomerId: c.id,
            customerDisplayName,
          })
        }
      }
    }

    last = customerPage.last
    page += 1
  }

  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return rows
}
