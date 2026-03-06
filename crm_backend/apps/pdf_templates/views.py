import io
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from jinja2 import Environment
from apps.core.permissions import IsAdminOrSuperuser
from apps.company.models import CompanyProfile
from .models import PDFTemplate
from .serializers import PDFTemplateSerializer


def get_document(module_type, pk):
    mapping = {
        "invoice":        ("apps.invoices.models", "Invoice"),
        "estimate":       ("apps.invoices.models", "Estimate"),
        "proforma":       ("apps.invoices.models", "ProformaInvoice"),
        "purchase_order": ("apps.invoices.models", "PurchaseOrder"),
        "final_invoice":  ("apps.invoices.models", "FinalInvoice"),
        "rfq":            ("apps.rfq.models",      "RFQ"),
    }
    if module_type not in mapping:
        raise KeyError(f"Unknown module_type: {module_type}")
    module_path, model_name = mapping[module_type]
    import importlib
    mod = importlib.import_module(module_path)
    Model = getattr(mod, model_name)
    return Model.objects.prefetch_related("items").get(pk=pk)


from jinja2 import Environment, pass_context
import re

def render_html(template_str, document, company):
    """Render Jinja2 template with document context."""
    
    # Create environment with custom filters
    env = Environment()
    
    # Add custom filters
    @pass_context
    def format_date(context, value, format="%d/%m/%Y"):
        """Format date object to string."""
        if hasattr(value, 'strftime'):
            return value.strftime(format)
        return str(value) if value else ""
    
    @pass_context
    def currency_format(context, value, decimals=2):
        """Format number as currency."""
        try:
            return f"{float(value):.{decimals}f}"
        except (ValueError, TypeError):
            return "0.00"
    
    def jinja_upper(value):
        """Convert string to uppercase."""
        if value:
            return str(value).upper()
        return ""
    
    def jinja_default(value, default_value=""):
        """Return default value if value is falsy."""
        return value if value else default_value
    
    def jinja_replace(value, old, new):
        """Replace substring in string."""
        if value:
            return str(value).replace(old, new)
        return ""
    
    # Register filters
    env.filters['upper'] = jinja_upper
    env.filters['default'] = jinja_default
    env.filters['replace'] = jinja_replace
    env.filters['date'] = format_date
    env.filters['floatformat'] = currency_format
    
    # Add custom tests
    env.tests['defined'] = lambda x: x is not None
    
    tmpl = env.from_string(template_str)
    
    # Prepare context
    context = {
        'obj': document,
        'company': company,
        'items': list(document.items.all()) if hasattr(document, 'items') else [],
        'doc_type': document._meta.verbose_name.title() if hasattr(document, '_meta') else "Document",
    }
    
    # Add loop variable for iteration
    if 'items' in context:
        context['loop'] = {'index': 1}  # This will be overridden by Jinja2's loop variable
    
    return tmpl.render(**context)


# def html_to_pdf(html_string):
#     """
#     Convert HTML to PDF using xhtml2pdf (pure Python, works on Windows).
#     Falls back to returning None if xhtml2pdf is not installed.
#     """
#     try:
#         from xhtml2pdf import pisa
#         buf = io.BytesIO()
#         pisa_status = pisa.CreatePDF(html_string, dest=buf)
#         if pisa_status.err:
#             return None, f"PDF generation error: {pisa_status.err}"
#         return buf.getvalue(), None
#     except ImportError:
#         return None, "xhtml2pdf not installed. Run: pip install xhtml2pdf"
from weasyprint import HTML

def html_to_pdf(html_string, request):
    buf = io.BytesIO()
    HTML(
        string=html_string,
        base_url=request.build_absolute_uri("/")  # 🔴 REQUIRED FOR LOGO
    ).write_pdf(buf)
    return buf.getvalue(), None

class PDFTemplateViewSet(viewsets.ModelViewSet):
    queryset = PDFTemplate.objects.all()
    serializer_class = PDFTemplateSerializer
    permission_classes = [IsAdminOrSuperuser]

    @action(
        detail=False,
        methods=["get"],
        url_path=r"generate/(?P<module_type>[^/.]+)/(?P<pk>[^/.]+)",
        permission_classes=[IsAuthenticated],
    )
    def generate(self, request, module_type=None, pk=None):
        # 1. Get document
        try:
            document = get_document(module_type, pk)
        except Exception as e:
            return Response({"detail": f"Document not found: {e}"}, status=status.HTTP_404_NOT_FOUND)

        # 2. Find template
        template = (
            PDFTemplate.objects.filter(module_type=module_type, is_default=True, is_active=True).first()
            or PDFTemplate.objects.filter(module_type=module_type, is_active=True).first()
        )
        if not template:
            return Response(
                {"detail": "No PDF template configured for this document type. Please create one in Settings → PDF Templates."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 3. Render HTML
        company = CompanyProfile.get_instance()
        try:
            html = render_html(template.html_body, document, company)
        except Exception as e:
            return Response({"detail": f"Template render error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Return PDF
        fmt = request.query_params.get("format", "pdf")
        if fmt == "html":
            return HttpResponse(html, content_type="text/html")

        # pdf_bytes, err = html_to_pdf(html)
        pdf_bytes, err = html_to_pdf(html, request)
        if err:
            # Graceful fallback: return HTML with a banner explaining the issue
            fallback_html = f"""
            <div style="background:#FFF3CD;border:1px solid #FFC107;padding:12px 16px;margin-bottom:16px;font-family:sans-serif;font-size:13px;border-radius:6px;">
            ⚠️ <strong>PDF library not available.</strong> {err}<br>
            Install it with: <code>pip install xhtml2pdf</code><br>
            Showing HTML preview instead.
            </div>
            """ + html
            return HttpResponse(fallback_html, content_type="text/html")

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'inline; filename="{module_type}_{pk}.pdf"'
        return response
