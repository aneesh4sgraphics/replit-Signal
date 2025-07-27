import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, GripVertical, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface ProductOrderingItem {
  id: string;
  productType: string;
  size: string;
  itemCode: string;
  pricePerSheet?: number;
  pricePerPack?: number;
  total?: number;
  quantity?: number;
  minQty?: number;
}

interface ProductOrderingDialogProps {
  items: ProductOrderingItem[];
  onReorder: (reorderedItems: ProductOrderingItem[]) => void;
  trigger: React.ReactNode;
  title?: string;
  description?: string;
}

export default function ProductOrderingDialog({ 
  items, 
  onReorder, 
  trigger, 
  title = "Reorder Products",
  description = "Drag and drop products to change their order in the PDF"
}: ProductOrderingDialogProps) {
  const [localItems, setLocalItems] = useState<ProductOrderingItem[]>(items);
  const [isOpen, setIsOpen] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(localItems);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);
    
    setLocalItems(reorderedItems);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...localItems];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    setLocalItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === localItems.length - 1) return;
    const newItems = [...localItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setLocalItems(newItems);
  };

  const resetOrder = () => {
    setLocalItems([...items]);
  };

  const applyOrder = () => {
    onReorder(localItems);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset to current items when opening
      setLocalItems([...items]);
    }
  };

  const sortOptions = [
    {
      label: "Sort by Product Type A-Z",
      action: () => setLocalItems([...localItems].sort((a, b) => a.productType.localeCompare(b.productType)))
    },
    {
      label: "Sort by Product Type Z-A", 
      action: () => setLocalItems([...localItems].sort((a, b) => b.productType.localeCompare(a.productType)))
    },
    {
      label: "Sort by Size (Small to Large)",
      action: () => setLocalItems([...localItems].sort((a, b) => {
        const aSize = parseFloat(a.size.split('"')[0]) || 0;
        const bSize = parseFloat(b.size.split('"')[0]) || 0;
        return aSize - bSize;
      }))
    },
    {
      label: "Sort by Price (Low to High)",
      action: () => setLocalItems([...localItems].sort((a, b) => (a.pricePerSheet || 0) - (b.pricePerSheet || 0)))
    },
    {
      label: "Sort by Price (High to Low)",
      action: () => setLocalItems([...localItems].sort((a, b) => (b.pricePerSheet || 0) - (a.pricePerSheet || 0)))
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Quick Sort Options */}
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Quick Sort:</span>
          {sortOptions.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={option.action}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={resetOrder}
            className="text-xs text-red-600 hover:text-red-700"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Drag & Drop List */}
        <div className="flex-1 overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="products">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {localItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-200' : 'hover:shadow-md'
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                <div>
                                  <div className="font-medium text-sm">{item.productType}</div>
                                  <div className="text-xs text-gray-500">{item.itemCode}</div>
                                </div>
                                <div className="text-sm">{item.size}</div>
                                <div className="flex gap-1">
                                  {item.pricePerSheet && (
                                    <Badge variant="secondary" className="text-xs">
                                      ${item.pricePerSheet.toFixed(2)}
                                    </Badge>
                                  )}
                                  {item.quantity && (
                                    <Badge variant="outline" className="text-xs">
                                      Qty: {item.quantity}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm font-medium">
                                  {item.total && `$${item.total.toFixed(2)}`}
                                  {item.pricePerPack && `$${item.pricePerPack.toFixed(2)}`}
                                </div>
                              </div>

                              {/* Manual Move Buttons */}
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveUp(index)}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveDown(index)}
                                  disabled={index === localItems.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Order Number */}
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={applyOrder}>
            Apply New Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}