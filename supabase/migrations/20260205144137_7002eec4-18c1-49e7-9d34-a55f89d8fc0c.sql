-- Create the trigger to fire on_receipt_status_change when receipts are updated
CREATE TRIGGER trigger_receipt_status_change
AFTER UPDATE ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.on_receipt_status_change();