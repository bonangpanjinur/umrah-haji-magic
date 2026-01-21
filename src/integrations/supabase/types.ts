export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_commissions: {
        Row: {
          agent_id: string
          booking_id: string
          commission_amount: number
          created_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          status: string | null
        }
        Insert: {
          agent_id: string
          booking_id: string
          commission_amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          status?: string | null
        }
        Update: {
          agent_id?: string
          booking_id?: string
          commission_amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_commissions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_code: string
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          branch_id: string | null
          commission_rate: number | null
          company_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          npwp: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_code: string
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          branch_id?: string | null
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          npwp?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_code?: string
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          branch_id?: string | null
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          npwp?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      airlines: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      airports: {
        Row: {
          city: string
          code: string
          country: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          city: string
          code: string
          country: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          city?: string
          code?: string
          country?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          checked_in_at: string | null
          checked_in_by: string | null
          checkpoint: string
          customer_id: string
          departure_id: string
          id: string
          notes: string | null
        }
        Insert: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          checkpoint: string
          customer_id: string
          departure_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          checkpoint?: string
          customer_id?: string
          departure_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: false
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      booking_passengers: {
        Row: {
          booking_id: string
          created_at: string | null
          customer_id: string
          id: string
          is_main_passenger: boolean | null
          passenger_type: string | null
          room_number: string | null
          room_preference: Database["public"]["Enums"]["room_type"] | null
          roommate_id: string | null
          special_requests: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          is_main_passenger?: boolean | null
          passenger_type?: string | null
          room_number?: string | null
          room_preference?: Database["public"]["Enums"]["room_type"] | null
          roommate_id?: string | null
          special_requests?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          is_main_passenger?: boolean | null
          passenger_type?: string | null
          room_number?: string | null
          room_preference?: Database["public"]["Enums"]["room_type"] | null
          roommate_id?: string | null
          special_requests?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_passengers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_passengers_roommate_id_fkey"
            columns: ["roommate_id"]
            isOneToOne: false
            referencedRelation: "booking_passengers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          addons_price: number | null
          adult_count: number | null
          agent_id: string | null
          base_price: number
          booking_code: string
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          branch_id: string | null
          child_count: number | null
          created_at: string | null
          currency: string | null
          customer_id: string
          departure_id: string
          discount_amount: number | null
          id: string
          infant_count: number | null
          notes: string | null
          paid_amount: number | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          remaining_amount: number | null
          room_type: Database["public"]["Enums"]["room_type"]
          sales_id: string | null
          total_pax: number | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          addons_price?: number | null
          adult_count?: number | null
          agent_id?: string | null
          base_price: number
          booking_code: string
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          branch_id?: string | null
          child_count?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id: string
          departure_id: string
          discount_amount?: number | null
          id?: string
          infant_count?: number | null
          notes?: string | null
          paid_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          remaining_amount?: number | null
          room_type?: Database["public"]["Enums"]["room_type"]
          sales_id?: string | null
          total_pax?: number | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          addons_price?: number | null
          adult_count?: number | null
          agent_id?: string | null
          base_price?: number
          booking_code?: string
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          branch_id?: string | null
          child_count?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          departure_id?: string
          discount_amount?: number | null
          id?: string
          infant_count?: number | null
          notes?: string | null
          paid_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          remaining_amount?: number | null
          room_type?: Database["public"]["Enums"]["room_type"]
          sales_id?: string | null
          total_pax?: number | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: false
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          province: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          province?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          province?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bus_providers: {
        Row: {
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
        }
        Insert: {
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
        }
        Update: {
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_purchase: number | null
          name: string
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase?: number | null
          name: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase?: number | null
          name?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      customer_documents: {
        Row: {
          created_at: string | null
          customer_id: string
          document_type_id: string
          file_name: string | null
          file_url: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          document_type_id: string
          file_name?: string | null
          file_url: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          document_type_id?: string
          file_name?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          birth_date: string | null
          birth_place: string | null
          blood_type: string | null
          branch_id: string | null
          city: string | null
          created_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          father_name: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_tour_leader: boolean | null
          mahram_name: string | null
          mahram_relation: string | null
          marital_status: string | null
          mother_name: string | null
          nik: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          province: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          birth_place?: string | null
          blood_type?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          father_name?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_tour_leader?: boolean | null
          mahram_name?: string | null
          mahram_relation?: string | null
          marital_status?: string | null
          mother_name?: string | null
          nik?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          birth_place?: string | null
          blood_type?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          father_name?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_tour_leader?: boolean | null
          mahram_name?: string | null
          mahram_relation?: string | null
          marital_status?: string | null
          mother_name?: string | null
          nik?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          province?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      departures: {
        Row: {
          arrival_airport_id: string | null
          booked_count: number | null
          created_at: string | null
          departure_airport_id: string | null
          departure_date: string
          departure_time: string | null
          flight_number: string | null
          id: string
          muthawif_id: string | null
          package_id: string
          quota: number
          return_date: string
          status: string | null
          team_leader_id: string | null
          updated_at: string | null
        }
        Insert: {
          arrival_airport_id?: string | null
          booked_count?: number | null
          created_at?: string | null
          departure_airport_id?: string | null
          departure_date: string
          departure_time?: string | null
          flight_number?: string | null
          id?: string
          muthawif_id?: string | null
          package_id: string
          quota?: number
          return_date: string
          status?: string | null
          team_leader_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arrival_airport_id?: string | null
          booked_count?: number | null
          created_at?: string | null
          departure_airport_id?: string | null
          departure_date?: string
          departure_time?: string | null
          flight_number?: string | null
          id?: string
          muthawif_id?: string | null
          package_id?: string
          quota?: number
          return_date?: string
          status?: string | null
          team_leader_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departures_arrival_airport_id_fkey"
            columns: ["arrival_airport_id"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departures_departure_airport_id_fkey"
            columns: ["departure_airport_id"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departures_muthawif_id_fkey"
            columns: ["muthawif_id"]
            isOneToOne: false
            referencedRelation: "muthawifs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departures_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departures_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
        }
        Relationships: []
      }
      equipment_distributions: {
        Row: {
          customer_id: string
          departure_id: string | null
          distributed_at: string | null
          distributed_by: string | null
          equipment_id: string
          id: string
          quantity: number | null
        }
        Insert: {
          customer_id: string
          departure_id?: string | null
          distributed_at?: string | null
          distributed_by?: string | null
          equipment_id: string
          id?: string
          quantity?: number | null
        }
        Update: {
          customer_id?: string
          departure_id?: string | null
          distributed_at?: string | null
          distributed_by?: string | null
          equipment_id?: string
          id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_distributions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_distributions_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: false
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_distributions_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          stock_quantity: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          stock_quantity?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          stock_quantity?: number | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string | null
          city: string
          created_at: string | null
          distance_to_masjid: string | null
          facilities: string[] | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          star_rating: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string | null
          distance_to_masjid?: string | null
          facilities?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          star_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string | null
          distance_to_masjid?: string | null
          facilities?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          star_rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          branch_id: string | null
          converted_at: string | null
          converted_booking_id: string | null
          created_at: string | null
          email: string | null
          follow_up_date: string | null
          full_name: string
          id: string
          notes: string | null
          package_interest: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          branch_id?: string | null
          converted_at?: string | null
          converted_booking_id?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_date?: string | null
          full_name: string
          id?: string
          notes?: string | null
          package_interest?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          branch_id?: string | null
          converted_at?: string | null
          converted_booking_id?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_date?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          package_interest?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_booking_id_fkey"
            columns: ["converted_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_package_interest_fkey"
            columns: ["package_interest"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      luggage: {
        Row: {
          created_at: string | null
          customer_id: string
          departure_id: string
          id: string
          status: string | null
          tag_code: string
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          departure_id: string
          id?: string
          status?: string | null
          tag_code: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          departure_id?: string
          id?: string
          status?: string | null
          tag_code?: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "luggage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "luggage_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: false
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
        ]
      }
      manifests: {
        Row: {
          departure_id: string
          file_url: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          version: number | null
        }
        Insert: {
          departure_id: string
          file_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          version?: number | null
        }
        Update: {
          departure_id?: string
          file_url?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manifests_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: false
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
        ]
      }
      muthawifs: {
        Row: {
          created_at: string | null
          email: string | null
          experience_years: number | null
          id: string
          is_active: boolean | null
          languages: string[] | null
          name: string
          phone: string | null
          photo_url: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name: string
          phone?: string | null
          photo_url?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name?: string
          phone?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          airline_id: string | null
          branch_id: string | null
          code: string
          created_at: string | null
          currency: string | null
          description: string | null
          duration_days: number
          excludes: string[] | null
          featured_image: string | null
          gallery: string[] | null
          hotel_madinah_id: string | null
          hotel_makkah_id: string | null
          id: string
          includes: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          itinerary: Json | null
          muthawif_id: string | null
          name: string
          package_type: Database["public"]["Enums"]["package_type"]
          price_double: number
          price_quad: number
          price_single: number
          price_triple: number
          updated_at: string | null
        }
        Insert: {
          airline_id?: string | null
          branch_id?: string | null
          code: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number
          excludes?: string[] | null
          featured_image?: string | null
          gallery?: string[] | null
          hotel_madinah_id?: string | null
          hotel_makkah_id?: string | null
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          itinerary?: Json | null
          muthawif_id?: string | null
          name: string
          package_type?: Database["public"]["Enums"]["package_type"]
          price_double?: number
          price_quad?: number
          price_single?: number
          price_triple?: number
          updated_at?: string | null
        }
        Update: {
          airline_id?: string | null
          branch_id?: string | null
          code?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number
          excludes?: string[] | null
          featured_image?: string | null
          gallery?: string[] | null
          hotel_madinah_id?: string | null
          hotel_makkah_id?: string | null
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          itinerary?: Json | null
          muthawif_id?: string | null
          name?: string
          package_type?: Database["public"]["Enums"]["package_type"]
          price_double?: number
          price_quad?: number
          price_single?: number
          price_triple?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_airline_id_fkey"
            columns: ["airline_id"]
            isOneToOne: false
            referencedRelation: "airlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_hotel_madinah_id_fkey"
            columns: ["hotel_madinah_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_hotel_makkah_id_fkey"
            columns: ["hotel_makkah_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_muthawif_id_fkey"
            columns: ["muthawif_id"]
            isOneToOne: false
            referencedRelation: "muthawifs"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          account_name: string | null
          account_number: string | null
          amount: number
          bank_name: string | null
          booking_id: string
          created_at: string | null
          id: string
          notes: string | null
          payment_code: string
          payment_method: string | null
          proof_url: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          amount: number
          bank_name?: string | null
          booking_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_code: string
          payment_method?: string | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          booking_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_code?: string
          payment_method?: string | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          province: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          province?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          province?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      savings_payments: {
        Row: {
          account_name: string | null
          amount: number
          bank_name: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_code: string
          payment_date: string
          payment_method: string | null
          proof_url: string | null
          savings_plan_id: string
          status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          account_name?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_code: string
          payment_date?: string
          payment_method?: string | null
          proof_url?: string | null
          savings_plan_id: string
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          account_name?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_code?: string
          payment_date?: string
          payment_method?: string | null
          proof_url?: string | null
          savings_plan_id?: string
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_payments_savings_plan_id_fkey"
            columns: ["savings_plan_id"]
            isOneToOne: false
            referencedRelation: "savings_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_plans: {
        Row: {
          converted_booking_id: string | null
          created_at: string | null
          customer_id: string
          id: string
          monthly_amount: number
          notes: string | null
          package_id: string
          paid_amount: number | null
          remaining_amount: number | null
          start_date: string
          status: string | null
          target_amount: number
          target_date: string
          tenor_months: number
          updated_at: string | null
        }
        Insert: {
          converted_booking_id?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          monthly_amount: number
          notes?: string | null
          package_id: string
          paid_amount?: number | null
          remaining_amount?: number | null
          start_date?: string
          status?: string | null
          target_amount: number
          target_date: string
          tenor_months?: number
          updated_at?: string | null
        }
        Update: {
          converted_booking_id?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          monthly_amount?: number
          notes?: string | null
          package_id?: string
          paid_amount?: number | null
          remaining_amount?: number | null
          start_date?: string
          status?: string | null
          target_amount?: number
          target_date?: string
          tenor_months?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_plans_converted_booking_id_fkey"
            columns: ["converted_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_plans_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_plans_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_code: { Args: never; Returns: string }
      generate_payment_code: { Args: never; Returns: string }
      generate_savings_payment_code: { Args: never; Returns: string }
      get_user_branch_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      user_belongs_to_branch: {
        Args: { _branch_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "owner"
        | "branch_manager"
        | "finance"
        | "operational"
        | "sales"
        | "marketing"
        | "equipment"
        | "agent"
        | "customer"
      booking_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
      document_status:
        | "pending"
        | "uploaded"
        | "verified"
        | "rejected"
        | "expired"
      gender_type: "male" | "female"
      lead_status:
        | "new"
        | "contacted"
        | "follow_up"
        | "negotiation"
        | "closing"
        | "won"
        | "lost"
      package_type: "umroh" | "haji" | "haji_plus" | "umroh_plus" | "tabungan"
      payment_status: "pending" | "partial" | "paid" | "refunded" | "failed"
      room_type: "quad" | "triple" | "double" | "single"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "owner",
        "branch_manager",
        "finance",
        "operational",
        "sales",
        "marketing",
        "equipment",
        "agent",
        "customer",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "processing",
        "completed",
        "cancelled",
        "refunded",
      ],
      document_status: [
        "pending",
        "uploaded",
        "verified",
        "rejected",
        "expired",
      ],
      gender_type: ["male", "female"],
      lead_status: [
        "new",
        "contacted",
        "follow_up",
        "negotiation",
        "closing",
        "won",
        "lost",
      ],
      package_type: ["umroh", "haji", "haji_plus", "umroh_plus", "tabungan"],
      payment_status: ["pending", "partial", "paid", "refunded", "failed"],
      room_type: ["quad", "triple", "double", "single"],
    },
  },
} as const
