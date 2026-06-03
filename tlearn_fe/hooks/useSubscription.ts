import { useCallback, useEffect, useState } from 'react';
import { subscriptionApi } from '@/services/modules/subscription';
import {
  PlanType,
  SubscriptionPlanDto,
} from '@/types/Subscription';
import { toast } from 'sonner';

export function useSubscription() {
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [upgradeLoadingPlan, setUpgradeLoadingPlan] = useState<PlanType | null>(null);

  const getPlans = useCallback(async () => {
    setPlansLoading(true);

    try {
      const res = await subscriptionApi.getPlans();

      if (res.data?.isSuccess && Array.isArray(res.data.data)) {
        const sortedPlans = [...res.data.data]
          .filter((plan) => plan.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        setPlans(sortedPlans);

        return {
          success: true,
          data: sortedPlans,
        };
      }

      toast.error(res.data?.error || 'Không thể tải danh sách gói nâng cấp');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Get subscription plans error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể tải danh sách gói nâng cấp'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const upgrade = async (planType: PlanType) => {
    setUpgradeLoadingPlan(planType);

    try {
      const res = await subscriptionApi.upgrade({
        planType,
      });

      if (res.data?.isSuccess && res.data.data?.checkoutUrl) {
        window.location.href = res.data.data.checkoutUrl;

        return {
          success: true,
          data: res.data.data,
        };
      }

      toast.error(res.data?.error || 'Không thể tạo liên kết thanh toán');

      return {
        success: false,
      };
    } catch (error: any) {
      console.error('Upgrade payment error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể tạo liên kết thanh toán'
      );

      return {
        success: false,
        error,
      };
    } finally {
      setUpgradeLoadingPlan(null);
    }
  };

  useEffect(() => {
    getPlans();
  }, [getPlans]);

  return {
    plans,
    plansLoading,
    upgradeLoadingPlan,
    getPlans,
    upgrade,
  };
}