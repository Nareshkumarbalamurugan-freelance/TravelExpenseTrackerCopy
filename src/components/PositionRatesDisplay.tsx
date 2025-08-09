import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPositionRates } from '@/lib/expenseCalculator';
import { DollarSign, Route } from 'lucide-react';

interface PositionRatesDisplayProps {
  selectedPosition?: string;
}

const PositionRatesDisplay: React.FC<PositionRatesDisplayProps> = ({ selectedPosition }) => {
  const [rates, setRates] = useState<{ [key: string]: { ratePerKm: number; dailyAllowance: number } }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const positionRates = await getPositionRates();
        setRates(positionRates);
      } catch (error) {
        console.error('Error loading position rates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, []);

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Loading position rates...</p>
        </CardContent>
      </Card>
    );
  }

  const selectedRate = selectedPosition ? rates[selectedPosition] : null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <DollarSign className="h-4 w-4" />
          <span>Position Rates</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedRate ? (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">{selectedPosition}</h4>
              <Badge variant="default">Selected</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-1">
                <Route className="h-3 w-3" />
                <span>₹{selectedRate.ratePerKm}/km</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>₹{selectedRate.dailyAllowance} daily</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Example: 50km = ₹{(selectedRate.ratePerKm * 50 + selectedRate.dailyAllowance).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(rates).map(([position, rate]) => (
              <div key={position} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                <span className="font-medium">{position}</span>
                <span className="text-muted-foreground">
                  ₹{rate.ratePerKm}/km + ₹{rate.dailyAllowance}
                </span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Select a position above to see your rates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PositionRatesDisplay;
