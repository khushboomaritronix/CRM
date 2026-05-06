from django.contrib import admin
from django.utils.html import format_html
from .models import DeliveryNote, DeliveryNoteItem


class DeliveryNoteItemInline(admin.TabularInline):
    model = DeliveryNoteItem
    extra = 1
    fields = (
        "item_name",
        "sku",
        "quantity_ordered",
        "quantity_delivered",
        "unit",
        "batch_number",
        "expiry_date",
    )
    readonly_fields = ()


@admin.register(DeliveryNote)
class DeliveryNoteAdmin(admin.ModelAdmin):
    list_display = (
        "delivery_number",
        "customer",
        "status_badge",
        "delivery_date",
        "total_items",
        "delivered_items",
        "created_at",
    )
    list_filter = ("status", "delivery_date", "created_at", "customer")
    search_fields = ("delivery_number", "customer__name", "tracking_number")
    readonly_fields = ("created_at", "updated_at", "total_items", "delivered_items")
    
    fieldsets = (
        ("Delivery Information", {
            "fields": ("delivery_number", "customer", "status", "delivery_date")
        }),
        ("References", {
            "fields": ("invoice_reference", "po_reference", "sales_order_reference"),
        }),
        ("Delivery Address", {
            "fields": (
                "delivery_address",
                "delivery_city",
                "delivery_state",
                "delivery_country",
                "delivery_postal_code",
            ),
        }),
        ("Dates", {
            "fields": (
                "expected_delivery_date",
                "delivered_date",
            ),
        }),
        ("Tracking", {
            "fields": (
                "tracking_number",
                "carrier",
            ),
        }),
        ("Items", {
            "fields": (
                "total_items",
                "delivered_items",
            ),
        }),
        ("Costs", {
            "fields": (
                "shipping_cost",
                "insurance_amount",
                "currency",
            ),
        }),
        ("Notes", {
            "fields": (
                "notes",
                "special_instructions",
            ),
        }),
        ("PDF", {
            "fields": ("pdf_template",),
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )
    
    inlines = [DeliveryNoteItemInline]
    ordering = ("-created_at",)
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            "draft": "#999999",
            "confirmed": "#0066cc",
            "in_transit": "#ff9900",
            "delivered": "#00cc00",
            "partially_received": "#ffcc00",
            "cancelled": "#cc0000",
        }
        color = colors.get(obj.status, "#999999")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Status"


@admin.register(DeliveryNoteItem)
class DeliveryNoteItemAdmin(admin.ModelAdmin):
    list_display = (
        "item_name",
        "delivery_note",
        "sku",
        "quantity_ordered",
        "quantity_delivered",
        "unit",
        "batch_number",
    )
    list_filter = ("unit", "delivery_note__status", "delivery_note__delivery_date")
    search_fields = ("item_name", "sku", "batch_number", "delivery_note__delivery_number")
    readonly_fields = ()
    
    fieldsets = (
        ("Item Details", {
            "fields": ("delivery_note", "item_name", "description", "sku")
        }),
        ("Quantities", {
            "fields": ("quantity_ordered", "quantity_delivered", "unit")
        }),
        ("Pricing", {
            "fields": ("unit_price", "total_price")
        }),
        ("Batch Information", {
            "fields": ("batch_number", "expiry_date")
        }),
    )
    
    ordering = ("-delivery_note__created_at",)
