# ESPECIFICACIÓN TÉCNICA Y ESQUEMA DE BASE DE DATOS (OPENSPEC)

## 1. Script SQL de Creación de Tablas (Para Supabase)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLA DE MÉTODOS DE PAGO
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_own BOOLEAN DEFAULT true,
    owner_name VARCHAR(100),
    closing_day INT,
    due_day INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE PERSONAS (Acreedores / Deudores)
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    associated_auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE GASTOS FIJOS Y SUSCRIPCIONES EN TARJETAS
CREATE TABLE recurring_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    estimated_amount DECIMAL(12,2) NOT NULL,
    actual_amount DECIMAL(12,2),
    payment_day INT NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si ya creaste la tabla anteriormente, ejecuta esta migración:
-- ALTER TABLE recurring_expenses ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;

-- TABLA DE TRANSACCIONES / COMPRAS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    installments_count INT DEFAULT 1,
    purchase_date DATE NOT NULL,
    first_installment_date DATE NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    beneficiary_person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    payer_person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE CUOTAS
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE PRÉSTAMOS PERSONALES (ARS / USD - TOMADOS Y OTORGADOS)
CREATE TABLE personal_loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lender_person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    loan_type VARCHAR(20) NOT NULL DEFAULT 'borrowed', -- 'borrowed' (me prestaron) o 'lent' (presté)
    initial_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
    loan_date DATE NOT NULL,
    expected_return_date DATE, -- NULL indica sin fecha fija de devolución / a convenir
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MIGRACIÓN RETROACTIVA PARA BASES DE DATOS EXISTENTES:
-- ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS loan_type VARCHAR(20) NOT NULL DEFAULT 'borrowed';
-- ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS expected_return_date DATE NULL;

-- TABLA DE ABONOS A PRÉSTAMOS
CREATE TABLE loan_repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID REFERENCES personal_loans(id) ON DELETE CASCADE,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE ABONOS RECIBIDOS DE TERCEROS DEUDORES
CREATE TABLE payments_received (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_received ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin Full Access" ON payment_methods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin Full Access" ON people FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin Full Access" ON recurring_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin Full Access" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin Full Access" ON personal_loans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin Full Access" ON payments_received FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage installments of their transactions" ON installments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM transactions
        WHERE transactions.id = installments.transaction_id
        AND transactions.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM transactions
        WHERE transactions.id = installments.transaction_id
        AND transactions.user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage repayments of their loans" ON loan_repayments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM personal_loans
        WHERE personal_loans.id = loan_repayments.loan_id
        AND personal_loans.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM personal_loans
        WHERE personal_loans.id = loan_repayments.loan_id
        AND personal_loans.user_id = auth.uid()
    )
);
```
