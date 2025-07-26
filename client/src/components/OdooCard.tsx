import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OdooCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function OdooCard({ title, description, children, className = "" }: OdooCardProps) {
  return (
    <Card className={`bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {(title || description) && (
        <CardHeader className="pb-4">
          {title && (
            <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={title || description ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  );
}