import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatsCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
  <Card className="animate-fade-in">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="text-3xl font-semibold">{value}</div>
      {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
    </CardContent>
  </Card>
);

export default StatsCard;
