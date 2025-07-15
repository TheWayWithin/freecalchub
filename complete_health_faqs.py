#!/usr/bin/env python3
"""
Complete FAQ v2 implementation for remaining health subcategory pages
Based on research from docs/FAQsv2.md
"""

import os
import re
from datetime import datetime

# Remaining health pages to process
HEALTH_PAGES = [
    'nutrition',
    'pregnancy', 
    'weight'
]

def update_nutrition_page():
    """Complete nutrition page FAQ v2 implementation"""
    file_path = "/Users/jamiewatters/DevProjects/freecalchub/health/nutrition/index.html"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Add FAQ schema to existing schema section
    schema_addition = '''        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question", "name": "What nutrition calculators are available on FreecalcHub?",
              "acceptedAnswer": { "@type": "Answer", "text": "FreecalcHub offers a <a href='/health/nutrition/calorie-macro-calculator/'>Comprehensive Calorie & Macro Calculator</a> that determines your daily calorie and macronutrient needs. This integrates perfectly with our <a href='/health/bmi/'>BMI Calculator</a> and <a href='/health/weight/'>Weight Management tools</a> for complete nutritional planning." }
            },
            {
              "@type": "Question", "name": "How do I calculate my daily calorie needs?",
              "acceptedAnswer": { "@type": "Answer", "text": "Your daily calorie needs depend on your Basal Metabolic Rate (BMR) and activity level, creating your Total Daily Energy Expenditure (TDEE). Use our <a href='/health/nutrition/calorie-macro-calculator/'>Comprehensive Calculator</a> along with <a href='/health/bmi/'>BMI</a> and <a href='/health/fitness/'>fitness tools</a> for accurate assessment." }
            },
            {
              "@type": "Question", "name": "What are macronutrients and how do I calculate them?",
              "acceptedAnswer": { "@type": "Answer", "text": "Macronutrients are protein, carbohydrates, and fats - the three main nutrients your body needs in large amounts. Our macro calculator determines optimal ratios based on your goals. Combine this with <a href='/health/weight/'>weight management tools</a> for comprehensive diet planning." }
            },
            {
              "@type": "Question", "name": "How accurate is the calorie and macro calculator?",
              "acceptedAnswer": { "@type": "Answer", "text": "Our nutrition calculators use evidence-based formulas including Mifflin-St Jeor and Harris-Benedict equations. While highly accurate for most people, individual metabolic variations exist. All calculations are performed securely in your browser as outlined in our <a href='/privacy/'>privacy policy</a>." }
            },
            {
              "@type": "Question", "name": "Can I use nutrition calculators for weight loss?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes! Our nutrition calculators are excellent for weight loss planning by creating appropriate calorie deficits. Combine our calorie calculator with <a href='/health/weight/'>weight management tools</a> and <a href='/health/bmi/'>BMI tracking</a> for comprehensive weight loss support." }
            },
            {
              "@type": "Question", "name": "How do I calculate protein requirements?",
              "acceptedAnswer": { "@type": "Answer", "text": "Protein needs vary by activity level, goals, and body composition. Our macro calculator provides personalized protein recommendations based on your fitness objectives. Use alongside our <a href='/health/fitness/'>fitness calculators</a> for optimal results." }
            },
            {
              "@type": "Question", "name": "What's the difference between BMR and TDEE?",
              "acceptedAnswer": { "@type": "Answer", "text": "BMR (Basal Metabolic Rate) is calories burned at rest, while TDEE (Total Daily Energy Expenditure) includes all daily activities. Our <a href='/health/nutrition/calorie-macro-calculator/'>Comprehensive Calculator</a> computes both to help you understand your complete energy needs." }
            },
            {
              "@type": "Question", "name": "Are nutrition calculators suitable for athletes?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes, our nutrition calculators accommodate higher activity levels typical for athletes. The macro calculator adjusts for intensive training. Combine with our <a href='/health/fitness/'>fitness tools</a> for sport-specific nutrition planning." }
            },
            {
              "@type": "Question", "name": "How do I track my nutritional progress?",
              "acceptedAnswer": { "@type": "Answer", "text": "Regular recalculation is important as your body and goals change. We recommend reassessing monthly or when weight changes significantly. Use our <a href='/date-time/'>date calculators</a> to schedule regular nutrition check-ins." }
            },
            {
              "@type": "Question", "name": "How often should I recalculate my nutrition needs?",
              "acceptedAnswer": { "@type": "Answer", "text": "Recalculate when your weight changes by 5+ pounds, activity level shifts, or goals change. Our <a href='/date-time/'>date and time tools</a> can help schedule regular assessments, while <a href='/health/weight/'>weight management</a> tools track your progress." }
            }
          ]'''
    
    # Find the end of the existing schema and add FAQ schema
    content = re.sub(
        r'(\s*\]\s*}\s*</script>)',
        schema_addition + r'\1',
        content
    )
    
    # Add FAQ HTML section before </main>
    faq_html = '''<section class="faq-section content-section">
<h2 class="section-title">Frequently Asked Questions (FAQ)</h2>
<div class="faq-index card">
<h3>FAQ Index</h3>
<ul>
<li><a href="#faq-cat-item-1">What nutrition calculators are available on FreecalcHub?</a></li>
<li><a href="#faq-cat-item-2">How do I calculate my daily calorie needs?</a></li>
<li><a href="#faq-cat-item-3">What are macronutrients and how do I calculate them?</a></li>
<li><a href="#faq-cat-item-4">How accurate is the calorie and macro calculator?</a></li>
<li><a href="#faq-cat-item-5">Can I use nutrition calculators for weight loss?</a></li>
<li><a href="#faq-cat-item-6">How do I calculate protein requirements?</a></li>
<li><a href="#faq-cat-item-7">What's the difference between BMR and TDEE?</a></li>
<li><a href="#faq-cat-item-8">Are nutrition calculators suitable for athletes?</a></li>
<li><a href="#faq-cat-item-9">How do I track my nutritional progress?</a></li>
<li><a href="#faq-cat-item-10">How often should I recalculate my nutrition needs?</a></li>
</ul>
</div>
<div class="faq-item" id="faq-cat-item-1">
<h3>
<button aria-controls="faq-cat-panel-1" aria-expanded="false" class="accordion">
What nutrition calculators are available on FreecalcHub?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-1" role="region">
<p>FreecalcHub offers a <a href="/health/nutrition/calorie-macro-calculator/">Comprehensive Calorie & Macro Calculator</a> that determines your daily calorie and macronutrient needs. This integrates perfectly with our <a href="/health/bmi/">BMI Calculator</a> and <a href="/health/weight/">Weight Management tools</a> for complete nutritional planning.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-2">
<h3>
<button aria-controls="faq-cat-panel-2" aria-expanded="false" class="accordion">
How do I calculate my daily calorie needs?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-2" role="region">
<p>Your daily calorie needs depend on your Basal Metabolic Rate (BMR) and activity level, creating your Total Daily Energy Expenditure (TDEE). Use our <a href="/health/nutrition/calorie-macro-calculator/">Comprehensive Calculator</a> along with <a href="/health/bmi/">BMI</a> and <a href="/health/fitness/">fitness tools</a> for accurate assessment.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-3">
<h3>
<button aria-controls="faq-cat-panel-3" aria-expanded="false" class="accordion">
What are macronutrients and how do I calculate them?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-3" role="region">
<p>Macronutrients are protein, carbohydrates, and fats - the three main nutrients your body needs in large amounts. Our macro calculator determines optimal ratios based on your goals. Combine this with <a href="/health/weight/">weight management tools</a> for comprehensive diet planning.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-4">
<h3>
<button aria-controls="faq-cat-panel-4" aria-expanded="false" class="accordion">
How accurate is the calorie and macro calculator?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-4" role="region">
<p>Our nutrition calculators use evidence-based formulas including Mifflin-St Jeor and Harris-Benedict equations. While highly accurate for most people, individual metabolic variations exist. All calculations are performed securely in your browser as outlined in our <a href="/privacy/">privacy policy</a>.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-5">
<h3>
<button aria-controls="faq-cat-panel-5" aria-expanded="false" class="accordion">
Can I use nutrition calculators for weight loss?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-5" role="region">
<p>Yes! Our nutrition calculators are excellent for weight loss planning by creating appropriate calorie deficits. Combine our calorie calculator with <a href="/health/weight/">weight management tools</a> and <a href="/health/bmi/">BMI tracking</a> for comprehensive weight loss support.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-6">
<h3>
<button aria-controls="faq-cat-panel-6" aria-expanded="false" class="accordion">
How do I calculate protein requirements?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-6" role="region">
<p>Protein needs vary by activity level, goals, and body composition. Our macro calculator provides personalized protein recommendations based on your fitness objectives. Use alongside our <a href="/health/fitness/">fitness calculators</a> for optimal results.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-7">
<h3>
<button aria-controls="faq-cat-panel-7" aria-expanded="false" class="accordion">
What's the difference between BMR and TDEE?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-7" role="region">
<p>BMR (Basal Metabolic Rate) is calories burned at rest, while TDEE (Total Daily Energy Expenditure) includes all daily activities. Our <a href="/health/nutrition/calorie-macro-calculator/">Comprehensive Calculator</a> computes both to help you understand your complete energy needs.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-8">
<h3>
<button aria-controls="faq-cat-panel-8" aria-expanded="false" class="accordion">
Are nutrition calculators suitable for athletes?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-8" role="region">
<p>Yes, our nutrition calculators accommodate higher activity levels typical for athletes. The macro calculator adjusts for intensive training. Combine with our <a href="/health/fitness/">fitness tools</a> for sport-specific nutrition planning.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-9">
<h3>
<button aria-controls="faq-cat-panel-9" aria-expanded="false" class="accordion">
How do I track my nutritional progress?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-9" role="region">
<p>Regular recalculation is important as your body and goals change. We recommend reassessing monthly or when weight changes significantly. Use our <a href="/date-time/">date calculators</a> to schedule regular nutrition check-ins.</p>
</div>
</div>
<div class="faq-item" id="faq-cat-item-10">
<h3>
<button aria-controls="faq-cat-panel-10" aria-expanded="false" class="accordion">
How often should I recalculate my nutrition needs?
<span class="accordion-icon"></span>
</button>
</h3>
<div class="panel" id="faq-cat-panel-10" role="region">
<p>Recalculate when your weight changes by 5+ pounds, activity level shifts, or goals change. Our <a href="/date-time/">date and time tools</a> can help schedule regular assessments, while <a href="/health/weight/">weight management</a> tools track your progress.</p>
</div>
</div>
</section>
'''
    
    content = content.replace('</section>\n</main>', '</section>\n' + faq_html + '</main>')
    
    # Add FAQ JavaScript
    content = content.replace(
        '<script defer="" src="/js/dark-mode.js"></script>',
        '<script defer="" src="/js/dark-mode.js"></script>\n<script defer="" src="/js/faq-accordion-v2.js"></script>'
    )
    
    # Update timestamps in schema
    current_time = "2025-07-14T15:50:00Z"
    content = re.sub(r'"dateModified":\s*"[^"]*"', f'"dateModified": "{current_time}"', content)
    content = re.sub(r'"datePublished":\s*"[^"]*"', f'"datePublished": "{current_time}"', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("✅ Updated nutrition page with FAQ v2")

def update_sitemap_timestamp(page_name, timestamp):
    """Update sitemap.xml with new timestamp for a page"""
    sitemap_path = "/Users/jamiewatters/DevProjects/freecalchub/sitemap.xml"
    
    with open(sitemap_path, 'r') as f:
        content = f.read()
    
    # Update the timestamp for the specific page
    pattern = rf'(<loc>https://freecalchub\.com/health/{page_name}/</loc>\s*<lastmod>)[^<]*(</lastmod>)'
    replacement = rf'\g<1>{timestamp}\g<2>'
    content = re.sub(pattern, replacement, content)
    
    with open(sitemap_path, 'w') as f:
        f.write(content)
    
    print(f"✅ Updated sitemap timestamp for {page_name}")

if __name__ == "__main__":
    print("🚀 Completing FAQ v2 implementation for remaining health pages...")
    
    # Update nutrition page
    update_nutrition_page()
    update_sitemap_timestamp('nutrition', '2025-07-14T15:50:00Z')
    
    print("✅ All health nutrition page FAQ v2 implementation complete!")