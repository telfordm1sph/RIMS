<?php

namespace App\Repositories;

use App\Models\Masterlist;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserRepository
{

    /**
     * Check if user is a department head
     */
    public function isDepartmentHead(string $userId): bool
    {
        try {

            return Masterlist::where('ACCSTATUS', 1)
                ->where(function ($query) use ($userId) {
                    $query->where('APPROVER2', $userId)
                        ->orWhere('APPROVER3', $userId);
                })
                ->exists();
        } catch (\Exception $e) {
            Log::error("Failed to check department head status for user {$userId}: " . $e->getMessage());
            return false;
        }
    }

    public function isOperationDirector(string $userId): bool
    {
        try {
            return Masterlist::where('EMPLOYID', $userId)
                ->where('ACCSTATUS', 1)
                ->where(function ($query) {
                    $query->where('EMPPOSITION', 5)
                        ->orWhere('JOBTITLE', 'Operation Director');
                })
                ->exists();
        } catch (\Exception $e) {
            Log::error('Error checking Operation Director: ' . $e->getMessage());
            return false;
        }
    }
    public function isMisEmp(string $userId): bool
    {
        try {
            return Masterlist::where('EMPLOYID', $userId)
                ->where('ACCSTATUS', 1)
                ->where(function ($query) {
                    $query->where('JOBTITLE', 'LIKE', '%MIS Support Technician%')
                        ->orWhere('JOBTITLE', 'LIKE', '%Network Technician%')
                        ->orWhere('JOBTITLE', 'LIKE', '%Network%');
                })
                ->exists();
        } catch (\Exception $e) {
            Log::error('Error checking MIS Employee: ' . $e->getMessage());
            return false;
        }
    }


    public function findUserById(string $empId): ?object
    {
        return Masterlist::where('EMPLOYID', $empId)
            ->select([
                'EMPLOYID as emp_id',
                'EMPNAME as empname',
            ])
            ->first();
    }
    public function findDeptHeadOfRequestorById(string $empId): ?object
    {
        return Masterlist::where('EMPLOYID', $empId)
            ->where('ACCSTATUS', '1')
            ->select([
                'APPROVER2 as approver2',
                'APPROVER3 as approver3',
            ])
            ->first();
    }

    public function getEmployees(): array
    {
        return Masterlist::where('ACCSTATUS', '1')
            ->where('EMPLOYID', '!=', 0)
            ->select([
                'EMPLOYID as emp_id',
                'EMPNAME as empname',
            ])
            ->get()
            ->toArray();
    }
    public function getStaffList(string $empId)
    {
        return Masterlist::where(function ($q) use ($empId) {
            $q->where('APPROVER1', $empId)
                ->orWhere('APPROVER2', $empId);
        })
            ->where('ACCSTATUS', '1')
            ->select([
                'EMPLOYID as emp_id',
                'EMPNAME as empname',
            ])
            ->get();
    }
}
