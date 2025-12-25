# 🗺️ Feature Roadmap & Next Steps

## Current Status
- ✅ **Step 1: Progressive Web App (PWA)** — COMPLETE
- ✅ **Step 2: iCalendar/ICS Export** — COMPLETE
- ⏳ **Step 3: Advanced Customization** — READY TO START
- ⏳ **Step 4: Untis Integration** — COMPLETE
- ⏳ **Step 5: Plugin System** — COMPLETE

---

## 🎯 Step 3: Advanced Customization (NEXT)

### Overview
Enable users to customize the app beyond the default configurations by:
1. Creating custom time entry types
2. Defining custom fields per entry type
3. Setting up workflow rules and validations

### 3.1 Custom Entry Types System

#### What Users Can Do
- Create new entry types beyond: Work, School, Vacation, Sick, Holiday
- Each type has: **Label**, **Emoji**, **Color**, **Description**
- Examples:
  - 🏋️ Fitness (personal time tracking)
  - 🏥 Medical Appointments (important events)
  - 🎓 Training (professional development)
  - 🤝 Meetings (project-specific)
  - 🔧 Maintenance (system tasks)

#### Implementation Details
- **Storage**: Custom types in `data.customEntryTypes[]`
- **UI**: Modal for creating/editing types (similar to settings)
- **Form Changes**: Dynamically populate dropdowns from custom types
- **Default Fallback**: 5 default types always available
- **Export**: Custom types preserved in JSON backup
- **iCal Export**: Custom types appear with custom colors in calendars

#### Technical Tasks
```javascript
// Data Structure
data.customEntryTypes = [
  {
    id: "fitness-001",
    label: "Fitness",
    emoji: "🏋️",
    color: "#f97316",  // CSS color
    description: "Personal fitness tracking"
  }
]

// Functions Needed
- createCustomType(label, emoji, color, description)
- editCustomType(id, updates)
- deleteCustomType(id)
- getCustomTypeById(id)
- getAllCustomTypes()
- isValidCustomType(type)
```

#### UI Changes
- **Settings Tab**: Add "Custom Entry Types" section
- **Create Button**: "+ New Entry Type"
- **Edit Modal**: For modifying types
- **Delete Confirmation**: "Are you sure?" dialog
- **Color Picker**: Integrated color selector
- **Emoji Picker**: Search/select from emoji list

#### Estimated Effort
- **Backend Logic**: 1-1.5 hours
- **UI Components**: 1-1.5 hours
- **Integration**: 0.5 hours
- **Testing**: 0.5 hours
- **Total**: ~4 hours

---

### 3.2 Custom Fields System

#### What Users Can Do
- Define custom fields that appear on every entry
- Set field type: Text, Number, Dropdown, Checkbox, Date
- Mark fields as Required or Optional
- Reorder fields via drag-and-drop
- Examples per type:
  - **For Work**: Project, Client, Billable (yes/no), Rate
  - **For School**: Subject, Teacher, Grade, Homework
  - **For Fitness**: Exercise, Reps, Weight, Notes

#### Implementation Details
- **Storage**: `data.customFields[]` with type associations
- **Form Rendering**: Dynamically build entry form based on fields
- **Validation**: Required field checks before saving
- **Export**: Custom field values included in JSON backup
- **iCal Export**: Custom fields as X-PROPERTY in iCal format

#### Technical Tasks
```javascript
// Data Structure
data.customFields = [
  {
    id: "field-project",
    entryType: "work",  // or "all" for every type
    label: "Project",
    type: "text",  // text, number, dropdown, checkbox, date
    required: true,
    description: "Which project were you working on?",
    placeholder: "e.g., Client Portal Redesign",
    options: []  // for dropdown type: ["Project A", "Project B"]
  }
]

// Functions Needed
- createCustomField(label, type, entryType, required)
- editCustomField(id, updates)
- deleteCustomField(id)
- getFieldsForEntryType(type)
- validateEntryWithFields(entry, fields)
- renderCustomFieldForm(fields)
```

#### UI Changes
- **Settings Tab**: Add "Custom Fields" section per entry type
- **Type Selector**: Choose which entry types this field applies to
- **Field Configuration**: Label, type, required, placeholder, options
- **Drag-Drop**: Reorder fields priority
- **Entry Form**: Auto-populate with custom fields
- **Validation**: Show required field errors

#### Estimated Effort
- **Backend Logic**: 1.5-2 hours
- **Form Rendering**: 1.5-2 hours
- **Validation System**: 0.5-1 hour
- **UI Components**: 1-1.5 hours
- **Testing**: 0.5 hours
- **Total**: ~6-7 hours

---

### 3.3 Workflow Rules & Automation

#### What Users Can Do
- Define conditional rules: "If type=X, then require field Y"
- Auto-fill fields based on rules
- Enforce field combinations
- Create validation flows
- Examples:
  - "If type=work AND time > 8h, require project field"
  - "If type=school, auto-fill subject list dropdown"
  - "If category=billable, require rate field"

#### Implementation Details
- **Storage**: `data.workflowRules[]` with conditions and actions
- **Trigger Points**: On entry creation, before save, on type change
- **Execution**: Rule engine evaluates conditions
- **Side Effects**: Auto-fill, field visibility, validation

#### Technical Tasks
```javascript
// Rule Structure
data.workflowRules = [
  {
    id: "rule-work-project",
    condition: {
      entryType: "work",
      minHours: 8
    },
    actions: [
      { type: "require", field: "project" },
      { type: "show", field: "billable" }
    ]
  }
]

// Functions Needed
- createWorkflowRule(condition, actions)
- editWorkflowRule(id, updates)
- deleteWorkflowRule(id)
- evaluateRules(entry)
- applyRuleActions(entry, actions)
- isRuleConditionMet(entry, condition)
```

#### UI Changes
- **Settings Tab**: Add "Workflow Rules" section
- **Rule Builder**: Visual condition + action pairs
- **Condition Panel**: Entry type, time ranges, field values
- **Action Panel**: Require, show, hide, auto-fill
- **Test Rule**: Preview what happens with example entry

#### Estimated Effort
- **Rule Engine**: 1.5-2 hours
- **Condition Evaluator**: 1 hour
- **Action Executor**: 0.5-1 hour
- **UI Rule Builder**: 1.5-2 hours
- **Testing**: 0.5 hour
- **Total**: ~5-6.5 hours

---

## 📊 Step 3 Summary

### Total Effort Estimate
- **3.1 Custom Entry Types**: 4 hours
- **3.2 Custom Fields**: 6-7 hours
- **3.3 Workflow Rules**: 5-6.5 hours
- **Integration & Testing**: 2-3 hours
- **Documentation**: 1-1.5 hours
- **TOTAL**: **18-21.5 hours** (3-4 days of solid development)

### Implementation Order
1. **Start with 3.1** (Custom Entry Types) — Foundation
2. **Then 3.2** (Custom Fields) — Builds on types
3. **Finally 3.3** (Workflow Rules) — Advanced logic
4. **Integrate Everything** — Connect systems
5. **Test Thoroughly** — All interactions

### Key Considerations
- ✅ Maintain backward compatibility (existing entries still work)
- ✅ Default configs for users who don't customize
- ✅ Clear UI explanations (help text, tooltips)
- ✅ Export/Import custom definitions in backup
- ✅ Performance (don't slow app with complex rules)
- ✅ Mobile-friendly UI for custom field forms

---

## 🔄 Dependencies Between Steps

```
Step 1: PWA ✅
   ↓
   └─→ (no dependencies)

Step 2: iCal Export ✅
   ↓
   └─→ Can use Step 1, optional

Step 3: Advanced Customization ⏳
   ↓
   ├─→ Can use Step 1 (PWA features)
   ├─→ Can use Step 2 (export custom fields as X-PROPERTY)
   └─→ MUST come before Step 4

Step 4: Untis Integration ⏳
   ↓
   ├─→ Requires Step 3 (custom types for school schedule)
   ├─→ Optional: Step 2 (export to calendar)
   └─→ Integrate school schedule as entries

Step 5: Plugin System ⏳
   ↓
   ├─→ Requires Step 3 (custom fields to extend)
   ├─→ Can extend Step 2 (export plugins)
   └─→ Architecture: Hook system for all features
```

---

## 📱 Post-Step 3 Possibilities

Once Step 3 is complete, you could:

### Advanced Features
- **A/B Testing**: Compare different workflow rules
- **Templates**: Save & load custom configurations
- **Themes**: Custom color schemes per user preference
- **Collaboration**: Share custom types & rules with team
- **Analytics Dashboard**: Custom field reporting & analysis
- **Bulk Operations**: Edit custom fields across all entries

### Integrations
- **Spreadsheet Export**: With custom fields as columns
- **Database Sync**: Push custom data to external DB
- **Webhook Triggers**: When rules match, call webhooks
- **IFTTT/Zapier**: Automate based on custom fields

### Mobile & Desktop
- **Mobile App**: React Native with custom fields
- **Desktop App**: Electron version with same features
- **Sync**: Cloud sync of custom configurations

---

## ⏱️ Timeline Estimate

### Current Pace: One step per session
- **Step 1 (PWA)**: ✅ Complete
- **Step 2 (iCal)**: ✅ Complete (TODAY)
- **Step 3 (Customization)**: ⏳ 3-4 days
- **Step 4 (Untis)**: ⏳ 2-3 days
- **Step 5 (Plugins)**: ⏳ 4-5 days

### Total Timeline: ~10-15 days (aggressive) or 3-4 weeks (relaxed)

---

## 🎯 Success Criteria for Step 3

✅ **Custom Entry Types**
- Users can create, edit, delete types
- Types appear in all dropdowns
- Types sync with iCal export
- Types persist in backups

✅ **Custom Fields**
- Fields render on entry forms
- Validation prevents invalid entries
- Fields export in JSON
- Fields appear in backups/imports

✅ **Workflow Rules**
- Rules evaluate correctly
- Actions execute on matching conditions
- UI provides clear feedback
- No performance degradation

✅ **Integration**
- Custom types, fields, and rules work together
- Existing data unaffected
- Settings persist across sessions
- Import/export includes customizations

---

## 📚 Resources & References

### Custom Fields Best Practices
- Salesforce Custom Fields: https://help.salesforce.com/s/articleView?id=sf.dev_fields_custom.htm
- WooCommerce Custom Fields: https://developer.woocommerce.com/2020/08/12/meta-fields/
- Notion Database Fields: https://www.notion.so/help/intro-to-databases

### Workflow Automation References
- Zapier Actions & Conditions: https://zapier.com/
- IFTTT Applets: https://ifttt.com/
- n8n Workflows: https://n8n.io/

### UI Component Patterns
- Material Design: Custom Fields & Workflows
- Ant Design: Form & Rules
- React Hook Form: Form validation patterns

---

<div align="center">

## 🚀 Ready to Start Step 3?

When you say "Yes", I'll implement:
1. Complete custom entry types system
2. Dynamic custom fields framework
3. Workflow rules engine
4. Full UI integration
5. Comprehensive testing

**Estimated Time**: 18-21 hours total (can split into sessions)

</div>

---

**Last Updated**: January 2025
**Current Phase**: Step 2 Complete, Step 3 Ready to Begin
**Roadmap Status**: On Track ✅
