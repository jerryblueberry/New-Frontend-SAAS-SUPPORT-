import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertClientProfileStep } from '../api/clientProfile';

export function useUpsertClientProfileStep() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ step, payload }) => {
			const res = await upsertClientProfileStep(step, payload);
			return res.data?.profile;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['clientProfile'] });
		},
	});
}
