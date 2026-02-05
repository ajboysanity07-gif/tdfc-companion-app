import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    label: string;
    value: number;
    isAccent?: boolean;
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function CalculationResultBox({ label, value, isAccent = false }: Props) {
    const formattedValue = formatCurrency(value).replace('PHP', '').replace('₱', '').trim();

    if (isAccent) {
        return (
            <div className="mt-4">
                <div className="mb-3 block uppercase tracking-wider text-[0.7rem] text-center font-black text-[#F57979]">
                    {label}
                </div>
                <Card className="border-2 border-[#F57979] bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/30">
                    <CardContent className="p-4 text-center">
                        <h4 className="text-[#F57979] font-variant-numeric-tabular text-2xl font-bold tracking-tight">
                            ₱ {formattedValue}*
                        </h4>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-3 block uppercase tracking-wider text-[0.7rem] text-center font-semibold text-muted-foreground">
                {label}
            </div>
            <Card className="border-2">
                <CardContent className="p-3 text-center">
                    <h5 className="font-bold font-variant-numeric-tabular text-xl">
                        ₱ {formattedValue}
                    </h5>
                </CardContent>
            </Card>
        </div>
    );
}
